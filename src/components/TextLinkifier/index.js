import React from "react";
import { Link } from "react-router-dom";
import LinkifyIt from "linkify-it";
import zones from "tlds";

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
      match.hashtag = true;
    },
  })
  .add("+", {
    validate: /^([1-9][0-9]*(\([0-9]*\)|-[0-9]*-))?[0]?[1-9][0-9\- ]*/,
    normalize: (match) => {
      match.phoneNumber = true;
    },
  });

const TextLinkifier = ({ text, getHashtagLink, getLinkProps }) => {
  if (!text) return text;

  const matches = linkify.match(text);

  if (!matches) return text;

  const elements = [];
  let lastIndex = 0;

  function safeEncodeURIComponent(str) {
    try {
      return encodeURIComponent(str);
    } catch {
      return "";
    }
  }

  matches.forEach((match, i) => {
    if (match.index > lastIndex) {
      elements.push(text.substring(lastIndex, match.index));
    }
    let component;
    const props =
      (typeof getLinkProps === "function" && getLinkProps(match)) || {};

    if (match.hashtag) {
      const encodedHashtag = safeEncodeURIComponent(match.url);
      component = (
        <Link
          key={i}
          to={
            getHashtagLink
              ? getHashtagLink(encodedHashtag)
              : `/home/posts?search=${encodedHashtag}`
          }
          className="hashtag"
          {...props}
        >
          {match.text}
        </Link>
      );
    } else if (match.phoneNumber) {
      component = (
        <a key={i} href={`tel:${match.url}`} className="hashtag" {...props}>
          {match.text}
        </a>
      );
    } else {
      component = (
        <a
          key={i}
          href={match.url}
          className="hashtag"
          target="_blank"
          rel="noreferrer"
          {...props}
        >
          {match.text}
        </a>
      );
    }

    elements.push(component);

    if (!matches[i + 1]) {
      elements.push(text.substring(match.lastIndex, text.length));
    }

    lastIndex = match.lastIndex;
  });

  return elements;
};

export default TextLinkifier;
