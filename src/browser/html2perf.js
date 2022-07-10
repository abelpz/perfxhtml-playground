import { parse } from "node-html-parser";

const ELEMENT_NODE = 1;
const TEXT_NODE = 3;

const camelToKebabCase = (str) =>
  str.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);

const kebabDataSet = (target) =>
  Object.keys(target).reduce((dataset, key) => {
    const newKey = camelToKebabCase(key);
    dataset[newKey] = target[key];
    return dataset;
  }, {});

const getDataset = (node) => {
  const dataSet = node.dataset;
  return kebabDataSet(dataSet);
};

const getProps = (node) => {
  const {
    "sub_type-ns": subTypeNs,
    sub_type: subType,
    ...dataset
  } = getDataset(node);
  const sub_type = {
    sub_type: subTypeNs ? `${subTypeNs}:${subType}` : subType
  };
  const props =
    dataset &&
    Object.keys(dataset).reduce((props, key) => {
      const att = key.match(/(?<=atts-).+/);
      if (att) {
        if (!props.atts) props.atts = {};
        props.atts[att] = dataset[key];
      } else props[key] = dataset[key];
      return props;
    }, {});
  return {
    ...props,
    ...sub_type
  };
};

const getContentFrom = (contentNode) => {
  let content = [];
  for (const node of contentNode.childNodes) {
    if (node.nodeType === TEXT_NODE) {
      content.push(node.textContent);
      continue;
    }
    if (node.getAttribute("class") === "meta-content") continue;
    content.push(getBlock(node));
  }
  return content;
}

const blockFrom = (node) => {
  if (node.hasAttribute("data-atts-number")) return {};
  const metaContent = node.querySelector(":scope > .meta-content");
  return {
    content: getContentFrom(node) || [],
    ...(metaContent && { meta_content: getContentFrom(metaContent) || [] })
  };
};

const getBlock = (node) => {
  const props = getProps(node);
  return {
    ...props,
    ...(node.childNodes.length && blockFrom(node))
  };
};

const getBlocksFrom = ({children: nodes}) => Array.from(nodes, (node) => getBlock(node));

function html2perf(perfHtml, sequenceId) {
  const sequenceElement = perfHtml.sequencesHtml[sequenceId];
  const props = getDataset(sequenceElement);

  return {
    ...props,
    blocks: getBlocksFrom(sequenceElement)
  };
}

export default html2perf;
