import React from "react";
import LinkifyIt from "linkify-it";
import zones from "tlds";
import { Link } from "react-router-dom";
import { useHistory } from "react-router-dom/cjs/react-router-dom.min";

const linkify = new LinkifyIt();

linkify
  .tlds(zones)
  .set({ fuzzyIP: true })
  .add("#", {
    validate: (text, pos, self) => {
      const tail = text?.slice(pos);

      if (!self.re.hashtag) {
        // eslint-disable-next-line
        self.re.hashtag = /((?:[^\x00-\x7F]|\w)+)(?=\s|$)/;
      }

      if (self.re.hashtag.test(tail)) {
        let match = tail.match(self.re.hashtag);
        return match[0].length;
      }

      return 0;
    },
    normalize: (match) => {
      match.url = `/home/posts?search=${match.url.replace("#", "%23")}`;
      match.hashtag = true;
    },
  });

const TokenParser = ({ text }) => {
  const history = useHistory();

  if (!text) return text;

  const matches = linkify.match(text);
  if (!matches) return text;

  const elements = [];
  let lastIndex = 0;

  matches.forEach((match, i) => {
    if (match.index > lastIndex) {
      elements.push(text.substring(lastIndex, match.index));
    }

    const isExternal =
      match.url.startsWith("http") ||
      match.url.endsWith(".pdf") ||
      match.url.endsWith(".jpg") ||
      match.url.endsWith(".png");

    const component = match.hashtag ? (
      <span
        key={i}
        className="hashtag"
        onClick={() => history.push(match.url)}
        style={{ cursor: "pointer" }}
      >
        {match.text}
      </span>
    ) : isExternal ? (
      <a
        key={i}
        href={match.url}
        target="_blank"
        rel="noopener noreferrer"
        className="hashtag"
      >
        {match.text}
      </a>
    ) : (
      <span
        key={i}
        className="hashtag"
        onClick={() => history.push(match.url)}
        style={{ cursor: "pointer" }}
      >
        {match.text}
      </span>
    );

    elements.push(component);

    if (!matches[i + 1]) {
      elements.push(text.substring(match.lastIndex));
    }

    lastIndex = match.lastIndex;
  });

  return elements;
};

export default TokenParser;
