// background.js
chrome.action.onClicked.addListener((tab) => {
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: contentScriptFunc,
  });
});

async function contentScriptFunc() {
  // 任意の時間待機する
  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  // ボタンをクリックする
  const click = async (el) => {
    el && (el.click() || console.log(el));
    await sleep(200);
  };

  // Qiitaのいいね、ストック、フォローをクリックする
  const qiitaFn = async () => {
    const a = Array.from(
      document.querySelectorAll(
        'div.p-items_main > div:nth-child(1) button[aria-label="いいねする"],div.p-items_main > div:nth-child(1) button[aria-label="ストックする"]',
      ),
    );
    const b = Array.from(
      document.querySelectorAll('div.p-items_main > div:nth-child(2) button'),
    ).filter((v) => v.textContent === 'フォロー');
    for await (const v of [...a, ...b]) {
      await click(v);
    }
  };

  // Zennのいいね、フォローをクリックする
  const zennFn = async () => {
    const a = document.querySelector('#share button[aria-label="いいね"][class^="LikeButton_button__"]');
    const b = Array.from(
      document.querySelectorAll('div[class^="Container_default__"] button[class^="FollowButton_button__"]'),
    ).filter((v) => v.textContent === 'フォロー');
    for await (const v of [a, ...b]) {
      await click(v);
    }
  };

  // noteのいいね、フォローをクリックする
  const noteFn = async () => {
    const a = document.querySelector('div.p-article__action button[aria-label="スキ"]');
    const b = document.querySelector('#sideCreatorProfile > span > span > button[data-type="primary"]');
    for await (const v of [a, b]) {
      await click(v);
    }
  };

  // Speaker Deckのいいね、フォローをクリックする
  const speakerdeckFn = async () => {
    const a = document.querySelector('.deck a[data-method="post"][href$="/star"]');
    const b = document.querySelector('.deck a[data-method="post"][href^="/connections/"]');
    for await (const v of [a, b]) {
      await click(v);
    }
  };

  // connpassのいいねをクリックする
  const connpassFn = async () => {
    const a = document.querySelector('span[title="ブックマークする"]:not([style="display: none;"])');
    const b = document.querySelector(
      'span[title="メンバーになると、このグループの新規イベントのお知らせが届いたりします"]:not([style="display: none;"])',
    );
    for await (const v of [a, b]) {
      await click(v);
    }
  };

  // サービスを判別する
  if (location.origin === 'https://qiita.com') {
    await qiitaFn();
  } else if (location.origin === 'https://zenn.dev') {
    await zennFn();
  } else if (
    location.origin === 'https://note.com' || !!document.querySelector('a[aria-label="home"][href="https://note.com/"]')
  ) {
    await noteFn();
  } else if (location.origin === 'https://speakerdeck.com') {
    await speakerdeckFn();
  } else if (/https:\/\/([a-z0-9-]+\.)?connpass\.com/.test(location.origin)) {
    await connpassFn();
  } else {
    // その他のサイトの場合
  }
}
