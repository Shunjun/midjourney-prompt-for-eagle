(() => {
  const noop = () => {};
  let disconnect = noop;

  const htmlEntities = [
    ["&", "&amp;"],
    ["<", "&lt;"],
    [">", "&gt;"],
    ['"', "&quot;"],
    ["'", "&apos;"],
    [" ", "&nbsp;"],
  ];

  const observerOptions = {
    childList: true,
    attributes: false,
    subtree: true,
  };

  function createObserver(element, callback) {
    const observre = new MutationObserver(callback);
    observre.observe(element, observerOptions);
    return () => observre.disconnect();
  }

  const collectImages = debounce((callback) => {
    try {
      const imgList = document.querySelectorAll("img");
      const pList = document.querySelectorAll("p");
      const imgOnScreen = [];
      const pOnScreen = [];

      imgList.forEach((img) => {
        const rect = img.getBoundingClientRect();
        if (rectOnScreen(rect)) {
          imgOnScreen.push(img);
        }
      });

      pList.forEach((p) => {
        const rect = p.getBoundingClientRect();
        if (rectOnScreen(rect)) {
          pOnScreen.push(p);
        }
      });
      const prompts = getPrompts(pOnScreen).join("\n");
      const img = findImgNode(imgOnScreen);

      if (img && prompts) {
        disconnect();
        img.setAttribute("eagle-annotation", prompts);
        callback();
      }
    } catch (err) {
      console.log(err);
      // noop
    }
  }, 250);

  function findImgNode(imgList) {
    if (!Array.isArray(imgList)) {
      return [];
    }
    return imgList.find((img) => {
      try {
        const src = new URL(img.src);
        return src.pathname.endsWith(".jpeg");
      } catch (error) {
        return false;
      }
    });
  }

  function getPrompts(pList) {
    if (!Array.isArray(pList)) {
      return [];
    }
    const contentSet = new Set();
    const result = [];

    pList.forEach((p) => {
      const innerText = removeTags(p.innerText);
      if (!contentSet.has(innerText)) {
        const html =
          p?.parentNode?.parentNode?.innerHTML || p?.parentNode?.innerHTML;
        const prompt = removeTags(html);
        contentSet.add(innerText);
        result.push(prompt);
      }
    });

    return result;
  }

  function removeTags(html) {
    let text = html.replace(/<[^>]*>/g, "");
    htmlEntities.forEach(([htmlEntity, character]) => {
      const regex = new RegExp(character, "g");
      text = text.replace(regex, htmlEntity);
    });
    return text;
  }

  function rectOnScreen(rect) {
    const clientWidth = document.documentElement.clientWidth;
    const clientHeight = document.documentElement.clientHeight;
    return (
      rect.width &&
      rect.height &&
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= clientHeight &&
      rect.right <= clientWidth
    );
  }

  function debounce(fn, delay) {
    let timer = null;
    return function () {
      if (timer) {
        clearTimeout(timer);
      }
      timer = setTimeout(() => {
        fn.apply(this, arguments);
      }, delay);
    };
  }

  function main() {
    return new Promise((resolve) => {
      const body = document.body;
      disconnect();
      disconnect = createObserver(body, () => {
        collectImages(resolve);
      });
      collectImages(resolve);
    });
  }

  main();
})();
