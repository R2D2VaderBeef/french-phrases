console.log("init");

let phrases = {};
let currentArray = []
let nextIndex = -1;
let nextState = -1;
let hasHint = false;
let score = 0;
let numberOf = 0;

getPhrases();
async function getPhrases() {
  console.log("fetching phrases")
  const response = await fetch("/phrases/higher.json");
  const resdata = await response.json();
  phrases = resdata;
  console.log("fetched")

  let selectLabel = document.createElement("label");
  selectLabel.for = "topic";
  selectLabel.textContent = "Choose a topic to revise phrases for:"

  let select = document.createElement("select");
  select.name = "topic";
  select.id = "topic";

  for (obj in phrases) {
    let option = document.createElement("option");
    option.value = obj;
    option.textContent = obj;
    select.appendChild(option);
  }
  let button = document.getElementById("button");
  button.textContent = "Test your Knowledge";
  button.style.display = "inline-block"

  let button2 = document.getElementById("button2");
  button2.textContent = "See Phrases";
  button2.style.display = "inline-block"


  let main = document.getElementById("main");
  main.appendChild(selectLabel)
  main.appendChild(select)
  main.appendChild(document.createElement("br"));

  document.getElementById("status").style.display = "none";
  console.log("ready")
}

function progress() {
  if (document.getElementById("topic")) {

    let button = document.getElementById("button")
    button.style.display = "none";

    let newTopic = document.getElementById("topic").value;
    document.getElementById("main").innerHTML = "";

    let array = [...phrases[newTopic]];
    currentArray = shuffle(array);
    nextIndex = 0;
    nextState = 0;
    numberOf = currentArray.length;
    score = 0;

    let textlabel = document.createElement("label")
    textlabel.for = "answer";
    textlabel.id = "question";
    textlabel.style = "display: block; margin: 5px;"

    let textarea = document.createElement("textarea");
    textarea.name = "answer";
    textarea.id = "answer";
    textarea.rows = 6;
    textarea.style.width = "60%"

    let main = document.getElementById("main");
    main.appendChild(textlabel);
    main.appendChild(textarea);

    button.textContent = "Submit"
    button.style.display = "inline-block"
    progress();
  }
  else if (nextIndex != -1) {
    if (nextState == 0) {

      if (nextIndex >= currentArray.length) return endSession();

      hasHint = false;
      
      let field = document.getElementById("answer");
      field.value = "";

      let question = document.getElementById("question");
      question.textContent = "What is the French for: " + currentArray[nextIndex].e;

      let diffP = document.getElementById("answerDiff");
      diffP.innerHTML = "";

      let swatch = document.getElementById("switch");
      swatch.textContent = "";

      let button = document.getElementById("button");
      button.textContent = "Submit";

      let button2 = document.getElementById("button2");
      button2.textContent = "Hint";

      nextState = 1;
    }
    else if (nextState == 1) {
      let field = document.getElementById("answer");
      let response = field.value;
      let answer = currentArray[nextIndex].f;

      let dice = stringSimilarity.compareTwoStrings(answer, response);
      let encouragement = dice == 1 ? "Perfect!" : dice >= 0.8 ? "You nearly had it." : dice >= 0.5 ? "Nice! This one just needs a little more work." : dice > 0.3 ? "This phrase needs some work." : dice <= 0.3 ? "Try writing it out a couple of times to get familiar with it" : "";

      // score
      if (dice >= 0.8) score++;
        
      let diffDiv = document.getElementById("answerDiff");
      diffDiv.innerHTML = "Answer: ";

      // diff highlighting
      let diff = Diff.diffChars(response, answer);
      let fragment = document.createDocumentFragment();

      diff.forEach((part) => {
        if (part.removed) return;
        const color = part.added ? 'red' : 'green';
        let span = document.createElement('span');
        span.style.color = color;
        span.appendChild(document.createTextNode(part.value));
        fragment.appendChild(span);
      });
      diffDiv.appendChild(fragment);

      let swatch = document.getElementById("switch");
      swatch.innerHTML = encouragement;

      let button = document.getElementById("button");
      button.textContent = "Next";

      nextIndex++;
      nextState = 0;
    }
  }
  else if (nextState == -1) {
    let selectLabel = document.createElement("label");
    selectLabel.for = "topic";
    selectLabel.textContent = "Choose a topic to revise phrases for:"

    let select = document.createElement("select");
    select.name = "topic";
    select.id = "topic";

    for (obj in phrases) {
      let option = document.createElement("option");
      option.value = obj;
      option.textContent = obj;
      select.appendChild(option);
    }
    let button = document.getElementById("button");
    button.textContent = "Test your Knowledge";
    button.style.display = "inline-block"

    let button2 = document.getElementById("button2");
    button2.textContent = "See Phrases";
    button2.style.display = "inline-block"

    let main = document.getElementById("main");
    main.appendChild(selectLabel)
    main.appendChild(select)
    main.appendChild(document.createElement("br"));

    let swatch = document.getElementById("switch")
    swatch.textContent = "";

    let diff = document.getElementById("answerDiff")
    diff.textContent = ""
  }
}

function endSession() {
  nextIndex = -1;
  document.getElementById("main").innerHTML = "";
  let swatch = document.getElementById("switch");
  swatch.textContent= "You got " + score.toString() + " out of " + numberOf.toString() + " phrases correct.";

  let diffP = document.getElementById("answerDiff");
  diffP.innerHTML = "Well done! You finished that topic, now try another!";

  let button = document.getElementById("button");
  button.textContent = "Main Menu";
  nextState = -1;
}

function shuffle(array) {
  let nextIndex = array.length, randomIndex;

  // While there remain elements to shuffle...
  while (nextIndex != 0) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * nextIndex);
    nextIndex--;

    // And swap it with the current element.
    [array[nextIndex], array[randomIndex]] = [
      array[randomIndex], array[nextIndex]];
  }

  return array;
}

function secondFunc() {
  if (document.getElementById("topic")) {

    let newTopic = document.getElementById("topic").value;
    let array = [...phrases[newTopic]];
    let div = document.getElementById("phraseDiv");
    if (div == null) {
      div = document.createElement("div");
      div.id = "phraseDiv"
    }
    div.innerHTML = "";

    for (let i = 0; i < array.length; i++) {
      let f = document.createElement("span");
      f.style["font-weight"] = "bold";
      f.textContent = array[i].f;

      let e = document.createElement("span");
      e.textContent = array[i].e;

      let p = document.createElement("p");
      p.appendChild(f);
      p.appendChild(document.createElement("br"));
      p.appendChild(e);

      div.appendChild(p);
    }

    let main = document.getElementById("main");
    main.appendChild(div);
  }
  else if (nextState == 1) {
    if (hasHint == true) return;
    let answer = currentArray[nextIndex].f.split(" ");
    let indices = []
    
    for (let i = 0; i < answer.length; i++) {
      indices.push(i)
    }
  
    let randomised = shuffle(indices);
    for (let i2 = 0; i2 < (randomised.length / 2 + 1); i2++) {
      answer[randomised[i2]] = "__ ";
    }
    
    let hint = answer.join(" ");
    let p = document.getElementById("switch");
    p.textContent = hint;
    hasHint = true;
  }
}