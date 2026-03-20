import React from "react";
import * as classnames from "classnames";
import PropTypes from "prop-types";
import Truncate from "react-truncate";
import { translate } from "../../../locales/locales";
import "./index.scss";

class TruncatedText extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      expanded: !!props.expanded,
      truncated: false,
    };

    this.handleTruncate = this.handleTruncate.bind(this);
    this.toggleLines = this.toggleLines.bind(this);
  }

  handleTruncate(truncated) {
    if (this.state.truncated !== truncated) {
      this.setState({
        truncated,
      });
    }
  }

  toggleLines(event) {
    event.preventDefault();
    this.setState({
      expanded: !this.state.expanded,
    });
  }

  render() {
    const { children, more, less, lines, className } = this.props;
    const { expanded, truncated } = this.state;

    return (
      // Рекомендуется заменить <p> на <div>, так как внутри могут быть блочные элементы
      <div
        className={classnames(
          "truncated-text",
          !truncated && "expanded",
          className,
        )}
      >
        <Truncate
          lines={!expanded && lines}
          ellipsis={
            <span>
              ...{" "}
              <button
                className="less-and-more"
                style={{ color: "#007AFF" }}
                onClick={this.toggleLines}
              >
                {translate(more, "app.more")}
              </button>
            </span>
          }
          onTruncate={this.handleTruncate}
          // Убираем display: none, чтобы Truncate всегда рендерил контент,
          // это позволяет избежать скачков при переключении
        >
          {children}
        </Truncate>

        {/* 
            ИЗМЕНЕНИЕ ЗДЕСЬ:
            Убрали проверку !truncated. 
            Если текст раскрыт (expanded) и передана пропса less, показываем кнопку.
        */}
        {expanded && less && (
          <span>
            {" "}
            <button
              className="less-and-more"
              style={{ color: "#007AFF" }}
              onClick={this.toggleLines}
            >
              {translate(less, "app.less")}
            </button>
          </span>
        )}
      </div>
    );
  }
}

TruncatedText.defaultProps = {
  expanded: false,
  lines: 3,
  more: "ещё",
  less: "",
};

TruncatedText.propTypes = {
  children: PropTypes.node.isRequired,
  lines: PropTypes.number,
  expanded: PropTypes.bool,
  less: PropTypes.string,
  more: PropTypes.string,
  className: PropTypes.string,
};

export default TruncatedText;