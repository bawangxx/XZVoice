const { substr } = require("ffmpeg-static");

// 按字数切分文本
function splitLongText(text, size) {
    //先按标点符号切分
    let texts = text.split(/[、，。；？！,!\\?\s]/);
    let textPart = "";
    let result = [];
    let len = 0;
    //再按size merge,避免标点符号切分出来的太短
    for (let i = 0; i < texts.length; i++) {
        console.log('--------111--------')
        if (textPart.length + texts[i].length + 1 > size) {
            result.push(textPart.toString());
            textPart = "";
            console.log('--------222--------')
        }
        textPart = textPart + texts[i];
        len += texts[i].length;
        if (len < text.length) {
            textPart = textPart + text.charAt(len);
            len += 1;
            console.log('--------333--------')
        }
    }
    // console.log(result)

    if (textPart.length > 0) {
        console.log('--------444--------')
        result.push(textPart.toString());
    }
    // console.log(result)
    return result;
}

function getSubString(str, len) {  
    var strlen = 0;  
    var s = "";  
    for (var i = 0; i < str.length; i++) {  
        if (str.charCodeAt(i) > 128) {  
            strlen += 2;  
        } else {  
            strlen++;  
        }  
        s += str.charAt(i);  
        if (strlen >= len) {  
            return s;  
        }  
    }  
    return s;  
} 
// let longText = `123456789`;


// console.log(longText.length);

// const size = 5;

// const zhengShu = parseInt(longText.length/size);
// const yushu = longText.length % size
// let resArr = [];
// for (let index = 0; index < zhengShu; index++) {
    
//     const subStr = getSubString(longText,size);
//     resArr.push(subStr);
//     longText = longText.replace(subStr,'')
// }
// const subStr = getSubString(longText,yushu);
// if(subStr != '') resArr.push(subStr);


// console.log(resArr);




let arr = ['1','2'];
let arr2 = ['3','4'];
arr = arr.concat(arr2)

console.log(arr);

 

