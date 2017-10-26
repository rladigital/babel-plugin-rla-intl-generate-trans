const trans = require("./trans");

trans("Text for translation");
trans("More Text for translation");
trans(
    "Text for putting in another language",
    {},
    "This is legal text so needs to be legally binding"
);
//trans(3);
trans("Yet more text for all the languages we support");
