import "./styles.css";
import PerfXDom from "./libs/perfxdom";
import PerfXHtml from "./libs/perfxhtml";
import Prism from 'prismjs';

// import isEqual from "lodash.isequal";
// import deepSort from "deep-sort-object";
import beautify from "js-beautify";

import marcDoc from "./perf/mrk_perf.json";
import psalmsDoc from "./perf/psa_perf_v0.2.0.json";

Prism.manual = true;

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
    renderPerf(perfDocuments[doc], "dom");
    renderPerf(perfDocuments[doc], "html");
    // renderPerf(perfDocuments[doc], "html");
  };
  nav.appendChild(button);
});

const createCodeElement = (className, lang) => {
  const codeContainer = document.createElement('div');
  const codePre = document.createElement('pre');
  const codeContent = document.createElement('code');
  codePre.className = `line-numbers language-${lang}`;
  codeContent.className = `language-${lang}`;
  codeContainer.className = className;
  codeContainer.id = "code-container";
  codeContainer.appendChild(codePre);
  codePre.appendChild(codeContent);

  return {codeContainer,codeContent,codePre};
}

const renderPerf = async (doc, type) => {
  const allowedTypes = ["html", "dom"];
  if (!allowedTypes.includes(type)) throw new Error("Invalid type");

  const documentsContainer = document.getElementById("documents");

  const perfDoc = doc.doc;
  const sequenceId = perfDoc["main_sequence_id"];

  const resultsContainer = document.createElement('div');
  resultsContainer.className = "results-container";
  documentsContainer.appendChild(resultsContainer);

  // const { codeContainer: jsonContainer, codeContent: jsonCodeEL, codePre: jsonPre } = createCodeElement("code-perf", "json");
  // const docJson = JSON.stringify({ [sequenceId]: perfDoc.sequences[sequenceId] }, undefined, 1);
  // jsonCodeEL.innerText = docJson;
  // Prism.highlightElement(jsonPre);
  // resultsContainer.appendChild(jsonContainer);

  console.time("PERF DOM TIME");
  const textContainer = document.createElement("article");

  const perfTitle = document.createElement("h1");
  perfTitle.innerHTML = perfDoc.metadata.document.toc;

  const perfResult = type === "html"
    ? await perfxhtml.readHtml(doc.bookcode)
    : await perfxdom.readHtml(doc.bookcode);

  const mainSequence = perfResult.sequencesHtml[sequenceId];

  if (type === "html") {
    textContainer.innerHTML = mainSequence;
  } else {
    textContainer.append(mainSequence);
  }

  if (perfResult) console.timeEnd("PERF DOM TIME");

  textContainer.prepend(perfTitle);
  const tag = document.createElement("span");
  tag.innerHTML = `perfx${type}`;
  textContainer.prepend(tag);
  resultsContainer.appendChild(textContainer);

  console.log(`perfx${type}`,{ mainSequence });
  // const { codeContainer: htmlContainer, codeContent: htmlCodeEL, codePre: htmlPre }  = createCodeElement("code-perf", "markup");
  // const docHtml = beautify.html(type === "html" ? mainSequence : mainSequence.outerHTML);
  // console.log(docHtml);
  // htmlCodeEL.innerText = docHtml;
  // Prism.highlightElement(htmlPre);
  // resultsContainer.appendChild(htmlContainer);
}