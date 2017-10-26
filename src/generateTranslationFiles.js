// import * as p from "path";
// import { writeFileSync } from "fs";
// import { sync as mkdirpSync } from "mkdirp";
const p = require("path");
const writeFileSync = require("fs").writeFileSync;
const mkdirpSync = require("mkdirp");
const csv = require("csv");

let messages = [];
let outputPath = "./i18n";
let baseFileName = "en.data";

module.exports = function(babel) {
    var t = babel.types;
    return {
        pre() {
            outputPath = this.opts.outputPath
                ? this.opts.outputPath
                : outputPath;
            baseFileName = this.opts.baseFileName
                ? this.opts.baseFileName
                : baseFileName;

            console.log(outputPath, baseFileName);
        },
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
            const filePathWithoutExtension = `${outputPath}/${baseFileName}`;
            generateCsv(messages, `${filePathWithoutExtension}.csv`);
            generateJson(messages, `${filePathWithoutExtension}.json`);
        }
    };
};

generateJson = (messageArray, filePath) => {
    const messageJson = messageArray.reduce((messageJson, message) => {
        return Object.assign(messageJson, {
            [message.id]: message.defaultMessage
        });
    }, {});

    writeFileSync(filePath, JSON.stringify(messageJson));
};

generateCsv = (messageArray, filePath) => {
    const columns = {
        id: "English",
        defaultMessage: "Translation",
        description: "Description"
    };
    csv.stringify(messageArray, { header: true, columns: columns }, function(
        err,
        messageArray
    ) {
        writeFileSync(filePath, messageArray);
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
