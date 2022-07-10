import "./styles.css";
import PerfXDom from "./libs/perfxdom";
import PerfXHtml from "./libs/perfxhtml";
import isEqual from "lodash.isequal";
import deepSort from "deep-sort-object";


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
    renderPerfDom(perfDocuments[doc]);
    renderPerfHtml(perfDocuments[doc]);
  };
  nav.appendChild(button);
});

const renderPerfDom = async (doc) => {
  console.time("PERF DOM TIME");
  const perfDoc = doc.doc;
  const documentsContainer = document.getElementById("documents");
  const perfContainer = document.createElement("article");
  const tag = document.createElement("span");
  tag.innerHTML = "perfxdom";
  const perfTitle = document.createElement("h1");
  perfTitle.innerHTML = perfDoc.metadata.document.toc;
  
  const perfDom = await perfxdom.readHtml(doc.bookcode);
  const sequenceId = perfDoc["main_sequence_id"];
  perfContainer.append(perfDom.sequencesHtml[sequenceId]);
  perfContainer.prepend(perfTitle);
  perfContainer.prepend(tag);
  documentsContainer.appendChild(perfContainer);
  if(perfDom) console.timeEnd("PERF DOM TIME");
}

const renderPerfHtml = async (doc) => {
  console.time("PERF HTML TIME");
  const perfDoc = doc.doc;
  const documentsContainer = document.getElementById("documents");
  const perfContainer = document.createElement("article");
  const tag = document.createElement("span");
  tag.innerHTML = "perfxhtml";
  const perfTitle = document.createElement("h1");
  perfTitle.innerHTML = perfDoc.metadata.document.toc;
  
  const perfHtml = await perfxhtml.readHtml(doc.bookcode);
  const sequenceId = perfDoc["main_sequence_id"];
  perfContainer.innerHTML = (perfHtml.sequencesHtml[sequenceId]);
  perfContainer.prepend(perfTitle);
  perfContainer.prepend(tag);
  documentsContainer.appendChild(perfContainer);
  if(perfHtml) console.timeEnd("PERF HTML TIME");
}
