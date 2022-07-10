export const createElement = (
  {
    tagName,
    classList = "",
    id = "",
    props = {},
    dataset = {},
    children
  }
) => {
  const element = document.createElement(tagName || "span");
  element.className = setClassList(classList);
  if(id) element.id = id;
  for (const key in props) {
    element.setAttribute(key, props[key]);
  }
  for (const key in dataset) {
    element.setAttribute(`data-${key}`, dataset[key]);
  }
  if (children) {
    if (typeof children === "function") children(child => element.append(child))
    else element.append(children);
  };
  return element;
};

const setClassList = classList => classList && Array.isArray(classList)
  ? classList.join(" ")
  : classList;

export const mapHtml = ({ type, subType, htmlMap }) => {
  const setDefaultClassList = (type, subType) => [...(type ? [type] : []), ...(subType ? [subType.replace(":", " ")] : [])];

  if (!htmlMap) return { classList: setDefaultClassList(type, subType) };

  const maps = [
    htmlMap[type]?.[subType],
    htmlMap["*"]?.[subType],
    htmlMap[type]?.["*"],
    htmlMap["*"]?.["*"]
  ];

  const getClassList = (classList) => classList && (Array.isArray(classList) ? classList : [classList]); 
  const result = maps.reduce((result, map) => {
    result.classList = result.classList.concat(getClassList(map?.classList) || []);
    if (!result.tagName && map?.tagName) result.tagName = map.tagName;
    return result;
  }, { classList: [], tagName: "" });

  return {
    classList: result.classList.length ? [...new Set(result.classList)] : setDefaultClassList(type, subType),
    tagName: result.tagName
  }
}

export const handleAtts = (atts) =>
  atts
    ? Object.keys(atts).reduce((attsProps, key) => {
        attsProps[`atts-${key}`] =
          typeof atts[key] === "object" ? atts[key].join(",") : atts[key];
        return attsProps;
      }, {})
    : {};

export const handleSubtypeNS = (subType) => {
  const subTypes = subType.split(":");
  return subTypes.length > 1
    ? { "sub_type-ns": subTypes[0], sub_type: subTypes[1] }
    : { sub_type: subType };
};
