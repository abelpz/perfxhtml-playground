import defaultHtmlMap from "./htmlmap.json";
import {
  createElement,
  handleAtts,
  handleSubtypeNS,
  mapHtml
} from "./helpers";

function perf2dom(perfDocument, sequenceId, htmlMap = defaultHtmlMap) {
  const contentChildren = (content, addChild) => content?.forEach(
    (element) =>
      addChild(
        typeof element === "string"
          ? element
          : contentElementHtml(element)
      )
  );

  const contentHtml = (content, className) => content && createElement({
    tagName: "span",
    classList: [className],
    children: (addChild) => contentChildren(content,addChild)
  });

  const contentElementHtml = (element) => {
    const {
      type,
      sub_type: subType,
      content,
      meta_content,
      atts,
      ...props
    } = element;
    const attsProps = handleAtts(atts);
    const subTypes = handleSubtypeNS(subType);
    const { classList, tagName } = mapHtml({type, subType, htmlMap});
    const innerHtml = (content,addChild) => {
      const getters = {
        markHtml: () => addChild(["chapter", "verses"].includes(subType) ? atts.number : ""),
        wrapperHtml: () => {
          contentChildren(content,addChild);
          if (meta_content) addChild(contentHtml(meta_content, "meta-content"));
        }
      };
      const getContentHtml = getters[`${type}Html`];
      return typeof getContentHtml === "function" ? getContentHtml() : "";
    };

    return createElement({
      tagName,
      classList,
      dataset: { type, ...subTypes, ...attsProps, ...props},
      children: (addChild) => innerHtml(content,addChild)
    });
  };

  const blockHtml = (block) => {
    const { type, sub_type: subType, atts, content, ...props } = block;
    const attsProps = handleAtts(atts);
    const subTypes = handleSubtypeNS(subType);
    const { classList, tagName } = mapHtml({type, subType, htmlMap});
    return createElement({
      tagName,
      classList,
      dataset: { type, ...subTypes, ...attsProps, ...props },
      children: (addChild) => contentChildren(content,addChild)
    });
  };

  const sequenceHtml = (perfSequence, sequenceId) => {
    const { blocks, ...props } = perfSequence;
    const { classList, tagName } = mapHtml({ type: props.type, subType: "sequence", htmlMap });
    return createElement({
      tagName,
      id: `${sequenceId}`,
      classList: classList,
      dataset: props,
      children: (addChild) => blocks?.forEach(
        (block) => addChild( blockHtml(block) )
      )
    });
  };
  const perfSequence = perfDocument.sequences[sequenceId];
  return sequenceHtml(perfSequence, sequenceId);
}

export default perf2dom;