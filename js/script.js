console.log("init");

let phrases = {};
let userPhrases = [];
let currentArray = []
let nextIndex = -1;
let nextState = -1;
let hasHint = false;
let score = 0;
let distribution = { "correct": 0, "half": 0, "wrong": 0 };
let numberOf = 0;

getPhrases();
async function getPhrases() {
    console.log("fetching phrases")
    const response = await fetch("/phrases/advh.json");
    const resdata = await response.json();
    phrases = resdata;
    console.log("fetched");

    let selectLabel = document.createElement("label");
    selectLabel.for = "topic";
    selectLabel.textContent = "Choose a phrase bank:"

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

function progress(input = "") {
    if (input != "") {
        if (nextState != -1) return;
    }
    if (document.getElementById("topic")) {

        let button = document.getElementById("button")
        button.style.display = "none";

        let newTopic;
        if (input != "") newTopic = input;
        else newTopic = document.getElementById("topic").value;
        document.getElementById("main").innerHTML = "";

        let array;
        if (newTopic == "Your Phrases") array = [...userPhrases];
        else array = [...phrases[newTopic]];
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

        let button3 = document.getElementById("button3");
        button3.textContent = "Quit";
        button3.style.display = "inline-block";

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
            button2.style.display = "inline-block"

            nextState = 1;
        }
        else if (nextState == 1) {
            let field = document.getElementById("answer");
            let response = field.value.trim();
            let answer = currentArray[nextIndex].f;

            let dice = stringSimilarity.compareTwoStrings(answer, response);
            let encouragement = dice == 1 ? "Perfect!" : dice >= 0.8 ? "You nearly had it." : dice >= 0.5 ? "Nice! This one just needs a little more work." : dice > 0.3 ? "This phrase needs some work." : dice <= 0.3 ? "Try writing it out a couple of times to get familiar with it" : "";

            // score and distribution
            if (dice >= 0.8) {
                score++;
                distribution.correct++;
            }
            else if (dice >= 0.5) {
                distribution.half++;
            }
            else {
                distribution.wrong++;
            }

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

            let button2 = document.getElementById("button2");
            button2.style.display = "none";

            nextIndex++;
            nextState = 0;
        }
    }
    else if (nextState == -1) {
        document.getElementById("main").innerHTML = "";

        let selectLabel = document.createElement("label");
        selectLabel.for = "topic";
        selectLabel.textContent = "Choose a phrase bank:"

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

        distribution = { "correct": 0, "half": 0, "wrong": 0 };
    }
}

function endSession() {
    let main = document.getElementById("main")
    main.innerHTML = "";
    let swatch = document.getElementById("switch");
    swatch.textContent = "You got " + score.toString() + " out of an attempted " + (numberOf - (numberOf - nextIndex)).toString() + " phrases correct.";
    nextIndex = -1;

    let diffP = document.getElementById("answerDiff");
    diffP.innerHTML = "";

    let canvas = document.createElement("canvas");
    canvas.id = "myChart";
    canvas.style.margin = "auto";

    let canvadiv = document.createElement("div");
    canvadiv.style.height = "40vh";
    canvadiv.style["min-height"] = "100px";
    canvadiv.style["max-height"] = "300px";
    canvadiv.style["text-align"] = "center";
    main.appendChild(canvadiv);
    canvadiv.appendChild(canvas);

    myChart = new Chart(canvas, {
        type: 'pie',
        data: {
            labels: [
                'Correct',
                'Mostly There',
                'Needs Work'
            ],
            datasets: [{
                label: 'Answers',
                data: [distribution.correct, distribution.half, distribution.wrong],
                backgroundColor: [
                    '#056b10',
                    '#f59211',
                    '#d11515',
                ],
                hoverOffset: 4
            }]
        }
    });

    let button = document.getElementById("button");
    button.textContent = "Main Menu";
    nextState = -1;

    let button2 = document.getElementById("button2");
    button2.style.display = "none";

    let button3 = document.getElementById("button3");
    button3.style.display = "none";
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
        let array;
        if (newTopic == "Your Phrases") array = userPhrases;
        else array = [...phrases[newTopic]];
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

        let main = document.getElementById("answerDiff");
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

function quitGame() {
    endSession()
}

function addOwnPhrase() {
    let f = document.getElementById("newfrench").value.trim();
    let e = document.getElementById("newenglish").value.trim();
    if (f == "" || e == "") return;

    document.getElementById("newfrench").value = "";
    document.getElementById("newenglish").value = "";

    if (userPhrases.length < 1) {
        console.log("userphrases");
        let select = document.getElementById("topic");
        let option = document.createElement("option");
        option.value = "Your Phrases";
        option.textContent = "Your Phrases";
        select.appendChild(option);
        phrases = { ...phrases, "Your Phrases": [] }
    }

    let index = (userPhrases.push({ "f": f, "e": e }) - 1).toString();
    let div = document.createElement("div");
    div.className = "ownphrase";
    div.id = "phrase" + index;

    let form = document.createElement("form");
    form.onsubmit = function () { event.preventDefault(); }

    let areaf = document.createElement("textarea");
    areaf.name = "french"
    areaf.placeholder = "French"
    areaf.id = "ownfrench" + index;
    areaf.rows = "3";
    areaf.value = f;

    let areae = document.createElement("textarea");
    areae.name = "english"
    areae.placeholder = "English"
    areae.id = "ownenglish" + index;
    areae.rows = "3";
    areae.value = e;

    let button = document.createElement("button");
    button.innerHTML = "Update"
    button.onclick = function () { updatePhrase(this); }
    button.id = "update" + index;

    let button2 = document.createElement("button");
    button2.innerHTML = "Delete"
    button2.onclick = function () { deletePhrase(this); }
    button2.id = "delete" + index;

    form.appendChild(areaf);
    form.appendChild(areae);
    form.appendChild(button);
    form.appendChild(button2);

    div.appendChild(form);
    document.getElementById("phrasecolumn").appendChild(div);
}

function updatePhrase(button) {
    let index = button.id.slice(6);
    let f = document.getElementById("ownfrench" + index).value.trim();
    let e = document.getElementById("ownenglish" + index).value.trim();
    userPhrases[parseInt(index)] = { "f": f, "e": e };
}

function deletePhrase(button) {
    let index = button.id.slice(6);
    userPhrases.splice(parseInt(index), 1);
    let div = document.getElementById("phrase" + index);
    div.remove();

    if (userPhrases.length < 1) {
        let select = document.getElementById("topic");
        select.innerHTML = select.innerHTML.split("<option value=\"Your Phrases\">Your Phrases</option>")[0];
        delete phrases["Your Phrases"];
    }
}

function savePhrases() {
    localStorage.setItem("userphrases", JSON.stringify(userPhrases));
    document.getElementById('savepopup').style.display = 'none';
}

function loadPhrases() {
    let boxes = document.querySelectorAll('.ownphrase');
    boxes.forEach(box => {
      box.remove();
    });

    let result = localStorage.getItem("userphrases");
    if (result != "[]") {
        if (userPhrases.length < 1) {
            console.log("userphrases");
            let select = document.getElementById("topic");
            let option = document.createElement("option");
            option.value = "Your Phrases";
            option.textContent = "Your Phrases";
            select.appendChild(option);
            phrases = { ...phrases, "Your Phrases": [] }
        }
        userPhrases = JSON.parse(result);
        for (let i = 0; i < userPhrases.length; i++) {
            let f = userPhrases[i].f;
            let e = userPhrases[i].e;

            let div = document.createElement("div");
            div.className = "ownphrase";
            div.id = "phrase" + i;

            let form = document.createElement("form");
            form.onsubmit = function () { event.preventDefault(); }

            let areaf = document.createElement("textarea");
            areaf.name = "french"
            areaf.placeholder = "French"
            areaf.id = "ownfrench" + i;
            areaf.rows = "3";
            areaf.value = f;

            let areae = document.createElement("textarea");
            areae.name = "english"
            areae.placeholder = "English"
            areae.id = "ownenglish" + i;
            areae.rows = "3";
            areae.value = e;

            let button = document.createElement("button");
            button.innerHTML = "Update"
            button.onclick = function () { updatePhrase(this); }
            button.id = "update" + i;

            let button2 = document.createElement("button");
            button2.innerHTML = "Delete"
            button2.onclick = function () { deletePhrase(this); }
            button2.id = "delete" + i;

            form.appendChild(areaf);
            form.appendChild(areae);
            form.appendChild(button);
            form.appendChild(button2);

            div.appendChild(form);
            document.getElementById("phrasecolumn").appendChild(div);
        }
    }
}

async function submitPhrases() {
    let name = document.getElementById("phrasebankname").value;
    let phrases = userPhrases;
    if (userPhrases.length < 1) {
        document.getElementById('submitpopup').style.display = 'none';
        document.getElementById('submitstatus').innerHTML = "Please add some phrases to be submitted."
        document.getElementById("statuspopup").style.display = "block";
        return;
    }
    let data = { "name": name, "phrases": phrases };
    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    };
    const response = await fetch('/submit', options);
    const resdata = await response.text();
    console.log(resdata);
    document.getElementById('submitpopup').style.display = 'none';
    if (resdata == "done") {
        document.getElementById('submitstatus').innerHTML = "Successfully submitted your phrase bank!<br/><br/>You can email me at invaderjmusician@gmail.com <br/>to check the status of your submission."
    }
    else {
        document.getElementById('submitstatus').innerHTML = "There was an error submitting your phrase bank.<br/>Please save it and try again later."
    }
    document.getElementById("statuspopup").style.display = "block";
}