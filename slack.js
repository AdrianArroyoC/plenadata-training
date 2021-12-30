const config = require('./config');

const db = require('./models');
const Slack = db.slack;

const {DateTime} = require('luxon');

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

async function slack(page) {
  const url = 'https://slack.com';
  await page.goto(url, {waitUntil: 'load'});

  // Go to login page
  const signInSelector = 'a[data-qa="link_sign_in_nav"]';
  const signIn = await page.waitForSelector(signInSelector);
  await signIn.click();

  // Type the email and password
  const emailSelector = 'input[data-qa="email_field"]';
  const email = await page.waitForSelector(emailSelector);
  await email.type(config.slack.email);
  const signInButtonSelector = '#submit_btn';
  const signInButton = await page.waitForSelector(signInButtonSelector);
  await signInButton.click();

  // Here is for the confirmation code
  await delay(15000);

  // Continue the process and wait for the selector
  const workspaceSelector = 'a[data-qa="current_workspaces_open_link"]';
  await page.waitForSelector(workspaceSelector);

  // Get the url of the workspace and go to it
  const workspaceUrl = await page.evaluate(() => {
    const workspaceElement = document.querySelector(
      'a[data-qa="current_workspaces_open_link"]'
    );
    return workspaceElement ? workspaceElement.getAttribute('href') : '';
  });
  await page.goto(workspaceUrl, {waitUntil: 'load'});

  // TODO: Avoid the popup to open the desktop app
  // Do it manually
  await delay(4000);

  // await page.focus('body');
  // await page.keyboard.press('Escape');

  // Avoid the dialogs
  // page.on('dialog', async dialog => {
  //   console.log('dialog: ', dialog);
  //   await dialog.dismiss();
  // });

  // Look if the redirect page appears and go to the url
  const redirectPageURL = await page.evaluate(() => {
    const redirect = document.querySelector('.p-ssb_redirect__launching_text');
    if (redirect) {
      const url = document.querySelector(
        '.p-ssb_redirect__loading_messages.align_center.margin_top_100.margin_bottom_150 a'
      );
      return url ? url.getAttribute('href') : '';
    }
  });
  await page.goto(redirectPageURL, {waitUntil: 'load'});

  // Select the channel
  const channelSelector =
    'div[data-qa="slack_kit_list"] div[data-qa="virtual-list-item"] .p-channel_sidebar__channel span[data-qa="channel_sidebar_name_help-training"]';
  const channel = await page.waitForSelector(channelSelector);
  await channel.click();
  await delay(2000);

  const messagePanleSelector = 'div[data-qa="message_pane"]';
  await page.waitForSelector(messagePanleSelector);
  // Small scroll to see if the classes change
  await page.evaluate(async () => {
    const scrollSelector = document.querySelector(
      '.c-virtual_list.c-virtual_list--scrollbar.c-message_list.c-message_list--dark.c-scrollbar.c-scrollbar--fade div[data-qa="slack_kit_scrollbar"][class="c-scrollbar__hider"]'
    );
    const internalDelay = ms => new Promise(resolve => setTimeout(resolve, ms));
    const classes =
      'p-message_pane p-message_pane--classic-nav p-message_pane--with-bookmarks-bar p-message_pane--with-bookmarks-bar-open';
    scrollSelector.scrollBy(0, -1000);
    await internalDelay(1000);
    while (
      document.querySelector('div[data-qa="message_pane"]').className !==
      classes
    ) {
      scrollSelector.scrollBy(0, -1000);
      await internalDelay(1000);
    }
  });
  await delay(1000);
  // await delay(25000);

  // Evaluate the page to get the messages
  const messages = await page.evaluate(() => {
    const messagesElements = Array.from(
      document.querySelectorAll(
        'div[data-qa="slack_kit_list"] div[data-qa="virtual-list-item"][role="listitem"]'
      )
    );
    return messagesElements.map(element => {
      const messageUser = element.querySelector(
        'a[data-qa="message_sender_name"]'
      );
      const user = messageUser ? messageUser.textContent : '';
      const ts = element.getAttribute('id');
      // Convert the dateTime (1640714899.021300) to a date
      const tsFixed = ts
        ? ts.split('.')[0].length === 13
          ? ts.split('.')[0]
          : `${ts.split('.')[0]}${ts.split('.')[1].substring(0, 3)}`
        : null;
      // const date = tsFixed ? new Date(parseInt(tsFixed)) : null;
      const messageText = element.querySelector('.p-rich_text_section');
      const messageURLs = element.querySelector('.c-pillow_file__description');
      const messageActions = element.querySelector(
        '.c-message__body.c-message__body--automated'
      );
      const text = messageActions
        ? messageActions.textContent
        : `${messageText ? messageText.textContent : ''} ${
            messageURLs ? messageURLs.textContent : ''
          }`;
      const messageReplies = element.querySelector(
        '.c-link.c-message__reply_count'
      );
      const replies = messageReplies
        ? parseInt(
            messageReplies.textContent
              .replace(' replies', '')
              .replace(' reply', '')
          )
        : 0;
      return {
        user,
        ts: tsFixed,
        text: text === ' ' ? '' : text,
        replies,
      };
    });
  });

  // Remove the messages without user and fix the date
  let lastMessageUser = '';
  for (const message of messages) {
    if (message.user !== '') {
      lastMessageUser = message.user;
    }
    if (message.user === '' && message.text !== '') {
      message.user = lastMessageUser;
    }
    if (message.user !== '') {
      const date = DateTime.fromMillis(parseFloat(message.ts)).toSQL();
      message.date = date;
      console.log(message);
      // Save the message in the database
      await Slack.create(message);
    }
  }
}

module.exports = slack;
