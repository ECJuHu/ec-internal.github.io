window.onload = function() {
    let fileId = window.location.hash;
    if (!fileId) {
        console.log("No fileId defined in FAQ!");
        return;
    } else {
        fileId = fileId.substring(1);
    }

    axios({
            method: 'get',
            url: `https://api.github.com/repos/ec-internal/ec-internal.github.io/contents/website-data/faq/${fileId}`,
            responseType: 'stream',
        })
        .then(function(response) {
            let b64Data = response.data.content;
            let data = atob(b64Data)
            renderQuestions(parseQuestions(data));
            enableToggle();
        });
};

function parseQuestions(input) {
    let parsedQuestions = [];
    const questionFlag = 'Q:';
    const answerFlag = 'A:';
    const listFlag = '- ';

    let inputArray = input.split('\n');

    let questionBuffer = {
        question: '',
        answer: ''
    }

    let currentTextType = 0; //0 = not defined, 1 = question, 2 = answer

    for (line of inputArray) {
        if (line.startsWith('#')) {
            continue;
        }
        if (line.startsWith(questionFlag)) {
            if (questionBuffer.question.length > 0) {
                parsedQuestions.push({...questionBuffer })
            }
            questionBuffer = {
                question: '',
                answer: ''
            }
            line = line.slice(questionFlag.length);
            questionBuffer.question = line;
            currentTextType = 1;
        } else if (line.startsWith(answerFlag)) {
            line = line.slice(answerFlag.length);
            questionBuffer.answer = line;
            currentTextType = 2;
        } else {
            if (currentTextType == 1) {
                questionBuffer.question += line + '<br>';
            } else if (currentTextType == 2) {
                if (line.startsWith(listFlag)) {
                    line = line.slice(listFlag.length);
                    questionBuffer.answer += '<li>' + line + '</li>';
                } else {
                    questionBuffer.answer += line + '<br>';
                }
            }
        }
    }

    if (questionBuffer.question.length > 0) {
        parsedQuestions.push({...questionBuffer })
    }

    return parsedQuestions;
}

function renderQuestions(questions) {
    for (let question of questions) {
        let template = `<div class="container"><div class="question">${question.question}</div><div class="answercont"><div class="answer">${question.answer}</div></div></div>`;
        $('#faq').append(template);
    }
}

//////////////////////////toggle faq section///////////////////////

function enableToggle() {
    let question = document.querySelectorAll(".question");

    question.forEach(question => {
        question.addEventListener("click", event => {
            const active = document.querySelector(".question.active");
            if (active && active !== question) {
                active.classList.toggle("active");
                active.nextElementSibling.style.maxHeight = 0;
            }
            question.classList.toggle("active");
            const answer = question.nextElementSibling;
            if (question.classList.contains("active")) {
                answer.style.maxHeight = answer.scrollHeight + "px";
            } else {
                answer.style.maxHeight = 0;
            }
        })
    })
}