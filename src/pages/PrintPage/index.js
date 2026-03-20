import React, { useCallback, useEffect } from "react";
import Notify from "@components/Notification";
import { isMobile } from "@common/utils";

const PRINT_DELAY = 300;

const PrintPage = ({ history, location }) => {
  const html = location.state?.html;

  const print = useCallback(async () => {
    Notify.clearAll();

    await sleep(PRINT_DELAY);
    window.print();

    // Check if it's a mobile phone or tablet and wait for the window gets focused again
    if (isMobile.any()) {
      await new Promise((resolve) => {
        const handleFocus = () => resolve();
        window.addEventListener("focus", handleFocus, { once: true });

        // if focus event doesn't fire
        setTimeout(() => {
          resolve();
          window.removeEventListener("focus", handleFocus);
        }, 500);
      });
    }

    history.goBack();
  }, [history]);

  useEffect(() => {
    if (!html) {
      history.goBack();
      return console.error("/print: No print data found");
    }

    void print();
  }, [html, print]);

  return <div dangerouslySetInnerHTML={{ __html: html }} />;
};

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export default PrintPage;
