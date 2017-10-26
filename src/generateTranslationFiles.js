// import * as p from "path";
// import { writeFileSync } from "fs";
// import { sync as mkdirpSync } from "mkdirp";
const p = require("path");
const writeFileSync = require("fs").writeFileSync;
const mkdirpSync = require("mkdirp");
const csv = require("csv");

let messages = [];

module.exports = function(babel) {
    var t = babel.types;
    return {
        visitor: {
            CallExpression(path, state) {
                //console.log(path.node.callee);
                //console.log(state.opts.outputPath);
                if (path.node.callee.name === "trans") {
                    const text = path.node.arguments[0].value;
                    const description = path.node.arguments[2]
                        ? path.node.arguments[2].value
                        : "";
                    if (typeof path.node.arguments[0].value !== "string") {
                        throw path.buildCodeFrameError(
                            "First argument to trans function must be a string"
                        );
                    }
                    //Check if the message is already there, and add if needed
                    if (messageNeedsToBeAdded(text, messages)) {
                        messages.push({
                            id: text,
                            defaultMessage: text,
                            description: description
                        });
                    }
                }
            }
        },
        post(file, state) {
            generateCsv(messages);

            const messageJson = messages.reduce((messageJson, message) => {
                return Object.assign(messageJson, {
                    [message.id]: message.defaultMessage
                });
            }, {});

            writeFileSync("output.json", JSON.stringify(messageJson));
        }
    };
};

generateCsv = messageArray => {
    const columns = {
        id: "English",
        defaultMessage: "Translation",
        description: "Description"
    };
    csv.stringify(messageArray, { header: true, columns: columns }, function(
        err,
        messageArray
    ) {
        writeFileSync("output.csv", messageArray);
    });
};

messageNeedsToBeAdded = (key, messages) => {
    for (let i = 0; i < messages.length; i++) {
        if (messages[i].id === key) {
            return false;
        }
    }

    return true;
};
