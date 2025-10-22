'use strict';
export var ValueType;
(function (ValueType) {
    ValueType[ValueType["Null"] = 0] = "Null";
    ValueType[ValueType["Merge"] = 1] = "Merge";
    ValueType[ValueType["Number"] = 2] = "Number";
    ValueType[ValueType["String"] = 3] = "String";
    ValueType[ValueType["Date"] = 4] = "Date";
    ValueType[ValueType["Hyperlink"] = 5] = "Hyperlink";
    ValueType[ValueType["Formula"] = 6] = "Formula";
    ValueType[ValueType["SharedString"] = 7] = "SharedString";
    ValueType[ValueType["RichText"] = 8] = "RichText";
    ValueType[ValueType["Boolean"] = 9] = "Boolean";
    ValueType[ValueType["Error"] = 10] = "Error";
    ValueType[ValueType["JSON"] = 11] = "JSON";
})(ValueType || (ValueType = {}));
export var FormulaType;
(function (FormulaType) {
    FormulaType[FormulaType["None"] = 0] = "None";
    FormulaType[FormulaType["Master"] = 1] = "Master";
    FormulaType[FormulaType["Shared"] = 2] = "Shared";
})(FormulaType || (FormulaType = {}));
export var RelationshipType;
(function (RelationshipType) {
    RelationshipType[RelationshipType["None"] = 0] = "None";
    RelationshipType[RelationshipType["OfficeDocument"] = 1] = "OfficeDocument";
    RelationshipType[RelationshipType["Worksheet"] = 2] = "Worksheet";
    RelationshipType[RelationshipType["CalcChain"] = 3] = "CalcChain";
    RelationshipType[RelationshipType["SharedStrings"] = 4] = "SharedStrings";
    RelationshipType[RelationshipType["Styles"] = 5] = "Styles";
    RelationshipType[RelationshipType["Theme"] = 6] = "Theme";
    RelationshipType[RelationshipType["Hyperlink"] = 7] = "Hyperlink";
})(RelationshipType || (RelationshipType = {}));
export var DocumentType;
(function (DocumentType) {
    DocumentType[DocumentType["Xlsx"] = 1] = "Xlsx";
})(DocumentType || (DocumentType = {}));
export var ReadingOrder;
(function (ReadingOrder) {
    ReadingOrder[ReadingOrder["LeftToRight"] = 1] = "LeftToRight";
    ReadingOrder[ReadingOrder["RightToLeft"] = 2] = "RightToLeft";
})(ReadingOrder || (ReadingOrder = {}));
export const ErrorValue = {
    NotApplicable: '#N/A',
    Ref: '#REF!',
    Name: '#NAME?',
    DivZero: '#DIV/0!',
    Null: '#NULL!',
    Value: '#VALUE!',
    Num: '#NUM!',
};
export default {
    ValueType,
    FormulaType,
    RelationshipType,
    DocumentType,
    ReadingOrder,
    ErrorValue,
};
//# sourceMappingURL=enums.js.map