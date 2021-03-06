import "./styles.css";
import PerfXDom from "./libs/perfxdom";
import PerfXHtml from "./libs/perfxhtml";
import isEqual from "lodash.isequal";
import deepSort from "deep-sort-object"

import marcDoc from "./perf/mrk_perf.json";
import psalmsDoc from "./perf/psa_perf_v0.2.0.json";

const perfxdom = new PerfXDom({docSetId:"id"});
perfxdom.sideloadPerf("MRK",marcDoc);
perfxdom.sideloadPerf("PSA",psalmsDoc);

const perfxhtml = new PerfXHtml({docSetId:"id"});
perfxhtml.sideloadPerf("MRK",marcDoc);
perfxhtml.sideloadPerf("PSA", psalmsDoc);

const perfDocuments = {
  marc: {
    name: "Marc (fra - no alignment)",
    doc: marcDoc,
    bookcode: "MRK"
  },
  psalms: {
    name: "Psalms (eng - with alignment)",
    doc: psalmsDoc,
    bookcode: "PSA"
  }
};

const nav = document.querySelector("nav#files");
Object.keys(perfDocuments).forEach((doc) => {
  const button = document.createElement("button");
  button.innerHTML = perfDocuments[doc].name;
  button.onclick = async (e) => {
    const documentsContainer = document.getElementById("documents");
    documentsContainer.innerHTML = "";
    const domResult = await renderPerf(perfDocuments[doc], "dom");
    const htmlResult = await renderPerf(perfDocuments[doc], "html");
    console.log({ domResult, htmlResult });
    console.log({equalResults: isEqual(domResult.outerHTML, htmlResult.outerHTML)})
  };
  nav.appendChild(button);
});

const renderPerf = async (doc, type) => {
  const tagName = `perfx${type}`;
  function log(content) {
    console.log(tagName, content);
  }

  const allowedTypes = ["html", "dom"];
  if (!allowedTypes.includes(type)) throw new Error("Invalid type");

  const documentsContainer = document.getElementById("documents");

  const perfDoc = doc.doc;
  const sequenceId = perfDoc["main_sequence_id"];

  const resultsContainer = document.createElement('div');
  resultsContainer.className = "results-container";
  documentsContainer.appendChild(resultsContainer);

  console.time("PERF DOM TIME");
  const textContainer = document.createElement("article");

  const perfTitle = document.createElement("h1");
  perfTitle.innerHTML = perfDoc.metadata.document.toc;

  const perfResult = type === "html"
    ? await perfxhtml.readHtml(doc.bookcode)
    : await perfxdom.readHtml(doc.bookcode);

  const mainSequence = perfResult.sequencesHtml[sequenceId];

  let result;
  if (type === "html"){
    textContainer.innerHTML = mainSequence;
    result = textContainer.firstChild;
  }else{
    textContainer.append(mainSequence);
    result = mainSequence;
  }
  
  if (perfResult) console.timeEnd("PERF DOM TIME");

  const newPerf = type === "html"
    ? await perfxhtml.writeHtml(doc.bookcode,sequenceId,perfResult)
    : await perfxdom.writeHtml(doc.bookcode, sequenceId, perfResult);
  
  log({ successfulRoundtrip: isEqual(mainSequence.outerHTML, newPerf.sequencesHtml[sequenceId].outerHTML) });

  textContainer.prepend(perfTitle);
  const tag = document.createElement("span");
  tag.innerHTML = tagName;
  textContainer.prepend(tag);
  resultsContainer.appendChild(textContainer);

  return result;
}