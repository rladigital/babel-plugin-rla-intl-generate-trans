// import * as p from "path";
// import { writeFileSync } from "fs";
// import { sync as mkdirpSync } from "mkdirp";
const p = require("path");
const writeFileSync = require("fs").writeFileSync;
const mkdirpSync = require("mkdirp");
const csv = require("csv");

module.exports = function(babel) {
    var t = babel.types;
    return {
        pre(file) {
            this.messages = [];
            //console.log(file);
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
                    this.messages.push({
                        id: text,
                        defaultMessage: text,
                        description: description
                    });
                }
            }
        },
        post(file, state) {
            generateCsv(this.messages);

            const messageJson = this.messages.reduce((messageJson, message) => {
                return Object.assign(messageJson, {
                    [message.id]: message.defaultMessage
                });
            }, {});

            writeFileSync("output.json", JSON.stringify(messageJson));
        }
    };
};

generateCsv = messages => {
    const columns = {
        id: "English",
        defaultMessage: "Translation",
        description: "Description"
    };
    csv.stringify(messages, { header: true, columns: columns }, function(
        err,
        messages
    ) {
        writeFileSync("output.csv", messages);
    });
};
