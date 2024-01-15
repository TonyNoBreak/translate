const input = document.querySelector(".input_textarea");
const inputSound = document.querySelector(".input_sound");
const outputSound = document.querySelector(".output_sound");
const output = document.querySelector(".output_textarea");
const translate = document.querySelector(".translate");
const invert = document.querySelector(".invert");

let inputText;
let input_language;

let outputText;
let output_language;

const inputLenguajes = [
  document.getElementById("input_en"),
  document.getElementById("input_fr"),
  document.getElementById("input_es"),
];
const outputLenguajes = [
  document.getElementById("output_en"),
  document.getElementById("output_fr"),
  document.getElementById("output_es"),
];

inputLenguajes.map((el) => {
  el.addEventListener("click", () => {
    inputLenguajes.map((el) => el.removeAttribute("class"));
    el.setAttribute("class", "active");

    input_language = el.getAttribute("id").slice(6);
  });
});

outputLenguajes.map((el) => {
  el.addEventListener("click", () => {
    outputLenguajes.map((el) => el.removeAttribute("class"));
    el.setAttribute("class", "active");

    output_language = el.getAttribute("id").slice(7);
  });
});

function manejarInputSound() {
  if (input.value.length > 0) {
    inputSound.removeEventListener("click", manejarInputSound);
    outputSound.removeEventListener("click", manejarOutputSound);
    inputSound.classList.add("activate");

    getAudio(true);
  }
}
function manejarOutputSound() {
  if (output.value.length > 0) {
    outputSound.removeEventListener("click", manejarOutputSound);
    inputSound.removeEventListener("click", manejarInputSound);
    outputSound.classList.add("activate");

    getAudio(false);
  }
}
inputSound.addEventListener("click", manejarInputSound);
outputSound.addEventListener("click", manejarOutputSound);

input.addEventListener("keyup", () => (inputText = input.value));

function manejarTranslate() {
  translate.removeEventListener("click", manejarTranslate);
  getTraduction(inputText, input_language, output_language);
}
translate.addEventListener("click", manejarTranslate);

invert.addEventListener("click", () => {
  input.value = output.value;

  inputLenguajes.map((el) => el.removeAttribute("class"));
  outputLenguajes.map((el) => el.removeAttribute("class"));

  getTraduction(inputText, output_language, input_language, true);
});

const getTraduction = async (
  text,
  inputL,
  outputL,
  invertTrueOrFalse = false
) => {
  const options = {
    method: "POST",
    headers: {
      accept: "application/json",
      "content-type": "application/json",
      authorization:
        "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiZjJlNjVkZDYtNzdiNi00YmFlLWE3ZTktYzU1MTg5YjJiYjJiIiwidHlwZSI6ImFwaV90b2tlbiJ9.XyIKTRJ-NU3FTMuqAjEHhRBNu3xwSeNMmsrDlOqXG64",
    },
    body: JSON.stringify({
      response_as_dict: true,
      attributes_as_list: false,
      show_original_response: true,
      providers: "google",
      fallback_providers: "microsoft",
      text: text,
      source_language: inputL,
      target_language: outputL,
    }),
  };

  try {
    const peticion = await fetch(
      "https://api.edenai.run/v2/translation/automatic_translation",
      options
    );
    const response = await peticion.json();
    const json = await response;
    outputText = await json.google.text;

    output.value = await outputText;

    if (invertTrueOrFalse) {
      outputLenguajes.map((el) => {
        if (el.getAttribute("id").slice(7) === outputL) {
          el.setAttribute("class", "active");
          output_language = el.getAttribute("id").slice(7);
        }
      });
      inputLenguajes.map((el) => {
        if (el.getAttribute("id").slice(6) === inputL) {
          el.setAttribute("class", "active");
          input_language = el.getAttribute("id").slice(6);
        }
      });
    }
    translate.addEventListener("click", manejarTranslate);
  } catch (e) {
    translate.addEventListener("click", manejarTranslate);
    console.log(e);
  }
};

const getAudio = (isInput) => {
  if (isInput ? input.value.length > 0 : output.value.length > 0) {
    const options = {
      method: "POST",
      headers: {
        accept: "application/json",
        "content-type": "application/json",
        authorization:
          "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiZjJlNjVkZDYtNzdiNi00YmFlLWE3ZTktYzU1MTg5YjJiYjJiIiwidHlwZSI6ImFwaV90b2tlbiJ9.XyIKTRJ-NU3FTMuqAjEHhRBNu3xwSeNMmsrDlOqXG64",
      },
      body: JSON.stringify({
        response_as_dict: true,
        attributes_as_list: false,
        show_original_response: true,
        settings: '{"google" : "google_model", "ibm": "ibm_model"}',
        rate: 0,
        pitch: 0,
        volume: 0,
        sampling_rate: 0,
        providers: "google",
        fallback_providers: "openai",
        language: isInput ? input_language : output_language,
        text: isInput ? input.value : output.value,
        option: "MALE",
      }),
    };

    const afterResponseOrError = () => {
      isInput
        ? inputSound.classList.remove("activate")
        : outputSound.classList.remove("activate");
      inputSound.addEventListener("click", manejarInputSound);
      outputSound.addEventListener("click", manejarOutputSound);
    };

    fetch("https://api.edenai.run/v2/audio/text_to_speech", options)
      .then((response) => response.json())
      .then((response) => {
        document
          .querySelector("audio")
          .setAttribute("src", response.openai.audio_resource_url);
        document.querySelector("audio").setAttribute("autoplay", "");
        afterResponseOrError();
      })
      .catch((err) => {
        afterResponseOrError();
      });
  }
};
