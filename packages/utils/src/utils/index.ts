/**
 *  金钱格式化，三位加逗号
 *  @param { number } num
 */
export const formatMoney = num => num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");


/**
 *  截取字符串并加身略号
 */
export function subText(str, length) {
  if (str.length === 0) {
    return '';
  }
  if (str.length > length) {
    return str.substr(0, length) + "...";
  } else {
    return str;
  }
}


/**
 * 获取文件base64编码
 * @param file
 * @param format  指定文件格式
 * @param size  指定文件大小(字节)
 * @param formatMsg 格式错误提示
 * @param sizeMsg   大小超出限制提示
 * @returns {Promise<any>}
 */
export function fileToBase64String(file, format = ['jpg', 'jpeg', 'png', 'gif'], size = 20 * 1024 * 1024, formatMsg = '文件格式不正确', sizeMsg = '文件大小超出限制') {
  return new Promise((resolve, reject) => {
    // 格式过滤
    const suffix = file.type.split('/')[1].toLowerCase();
    let inFormat = false;
    for (let i = 0; i < format.length; i++) {
      if (suffix === format[i]) {
        inFormat = true;
        break;
      }
    }
    if (!inFormat) {
      reject(formatMsg);
    }
    // 大小过滤
    if (file.size > size) {
      reject(sizeMsg);
    }
    // 转base64字符串
    const fileReader = new FileReader();
    fileReader.readAsDataURL(file);
    fileReader.onload = () => {
      const res = fileReader.result;
      resolve({ base64String: res, suffix: suffix });
      reject('异常文件，请重新选择');
    }
  })
}

/**
 * B转换到KB,MB,GB并保留两位小数
 * @param { number } fileSize
 */
export function formatFileSize(fileSize) {
  let temp;
  if (fileSize < 1024) {
    return fileSize + 'B';
  } else if (fileSize < (1024 * 1024)) {
    temp = fileSize / 1024;
    temp = temp.toFixed(2);
    return temp + 'KB';
  } else if (fileSize < (1024 * 1024 * 1024)) {
    temp = fileSize / (1024 * 1024);
    temp = temp.toFixed(2);
    return temp + 'MB';
  } else {
    temp = fileSize / (1024 * 1024 * 1024);
    temp = temp.toFixed(2);
    return temp + 'GB';
  }
}

/**
 *  base64转file
 *  @param { base64 } base64
 *  @param { string } filename 转换后的文件名
 */
export const base64ToFile = (base64, filename) => {
  const arr = base64.split(',');
  const mime = arr[0].match(/:(.*?);/)[1];
  const suffix = mime.split('/')[1];// 图片后缀
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n)
  }
  return new File([u8arr], `${filename}.${suffix}`, { type: mime })
};

/**
 *  base64转blob
 *  @param { base64 } base64
 */
export const base64ToBlob = base64 => {
  // eslint-disable-next-line prefer-const
  let arr = base64.split(','),
    // eslint-disable-next-line prefer-const
    mime = arr[0].match(/:(.*?);/)[1],
    // eslint-disable-next-line prefer-const
    bstr = atob(arr[1]),
    n = bstr.length,
    // eslint-disable-next-line prefer-const
    u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
};

/**
 *  blob转file
 *  @param { blob } blob
 *  @param { string } fileName
 */
export const blobToFile = (blob, fileName) => {
  blob.lastModifiedDate = new Date();
  blob.name = fileName;
  return blob;
};

/**
 * file转base64
 * @param { * } file 图片文件
 */
export const fileToBase64 = file => {
  const reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onload = function (e) {
    // @ts-ignore
    return e.target.result
  };
};

/**
 * 递归生成树形结构
 */
export function getTreeData(data, pid, pidName = 'parentId', idName = 'id', childrenName = 'children') {
  const arr = [];

  for (let i = 0; i < data.length; i++) {
    if (data[i][pidName] == pid) {
      data[i].key = data[i][idName];
      // @ts-ignore
      data[i][childrenName] = getTreeData(data, data[i][idName], pidName, idName, childrenName);
      // @ts-ignore
      arr.push(data[i]);
    }
  }

  return arr;
}


/**
 * 遍历树节点
 */
export function foreachTree(data, childrenName = 'children', callback) {
  for (let i = 0; i < data.length; i++) {
    callback(data[i]);
    if (data[i][childrenName] && data[i][childrenName].length > 0) {
      foreachTree(data[i][childrenName], childrenName, callback);
    }
  }
}


/**
 * 追溯父节点
 */
export function traceParentNode(pid, data, rootPid, pidName = 'parentId', idName = 'id', childrenName = 'children') {
  let arr = [];
  foreachTree(data, childrenName, (node) => {
    if (node[idName] == pid) {
      // @ts-ignore
      arr.push(node);
      if (node[pidName] != rootPid) {
        arr = arr.concat(traceParentNode(node[pidName], data, rootPid, pidName, idName));
      }
    }
  });
  return arr;
}


/**
 * 寻找所有子节点
 */
export function traceChildNode(id, data, pidName = 'parentId', idName = 'id', childrenName = 'children') {
  let arr = [];
  foreachTree(data, childrenName, (node) => {
    if (node[pidName] == id) {
      // @ts-ignore
      arr.push(node);
      arr = arr.concat(traceChildNode(node[idName], data, pidName, idName, childrenName));
    }
  });
  return arr;
}

/**
 * 根据pid生成树形结构
 *  @param { object } items 后台获取的数据
 *  @param { * } id 数据中的id
 *  @param { * } link 生成树形结构的依据
 */
export const createTree = (items, id = null, link = 'pid') => {
  items.filter(item => item[link] === id).map(item => ({ ...item, children: createTree(items, item.id) }));
};


/**
 * 查询数组中是否存在某个元素并返回元素第一次出现的下标 
 * @param {*} item 
 * @param { array } data
 */
export function inArray(item, data) {
  for (let i = 0; i < data.length; i++) {
    if (item === data[i]) {
      return i;
    }
  }
  return -1;
}


/**
 *  Windows根据详细版本号判断当前系统名称
 * @param { string } osVersion 
 */
export function OutOsName(osVersion) {
  if (!osVersion) {
    return
  }
  const str = osVersion.substr(0, 3);
  if (str === "5.0") {
    return "Win 2000"
  } else if (str === "5.1") {
    return "Win XP"
  } else if (str === "5.2") {
    return "Win XP64"
  } else if (str === "6.0") {
    return "Win Vista"
  } else if (str === "6.1") {
    return "Win 7"
  } else if (str === "6.2") {
    return "Win 8"
  } else if (str === "6.3") {
    return "Win 8.1"
  } else if (str === "10.") {
    return "Win 10"
  } else {
    return "Win"
  }
}


/**
 * 判断手机是Andoird还是IOS
 *  0: ios
 *  1: android
 *  2: 其它
 */
export function getOSType() {
  const u = navigator.userAgent
  const isAndroid = u.indexOf('Android') > -1 || u.indexOf('Linux') > -1;
  const isIOS = !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/);
  if (isIOS) {
    return 0;
  }
  if (isAndroid) {
    return 1;
  }
  return 2;
}


/**
 * @desc 函数防抖
 * @param { function } func
 * @param { number } wait 延迟执行毫秒数
 * @param { boolean } immediate  true 表立即执行，false 表非立即执行
 */
export function debounce(func, wait, immediate) {
  let timeout;
  return function () {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const context = this;
    // eslint-disable-next-line prefer-rest-params
    const args = arguments;

    if (timeout) clearTimeout(timeout);
    if (immediate) {
      const callNow = !timeout;
      timeout = setTimeout(() => {
        timeout = null;
      }, wait);
      if (callNow) func.apply(context, args)
    }
    else {
      timeout = setTimeout(() => {
        func.apply(context, args)
      }, wait);
    }
  }
}


/**
 * @desc 函数节流
 * @param { function } func 函数
 * @param { number } wait 延迟执行毫秒数
 * @param { number } type 1 表时间戳版，2 表定时器版
 */
export function throttle(func, wait, type) {
  let previous, timeout;
  if (type === 1) {
    previous = 0;
  } else if (type === 2) {
    timeout = null;
  }
  return function () {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const context = this;
    // eslint-disable-next-line prefer-rest-params
    const args = arguments;
    if (type === 1) {
      const now = Date.now();

      if (now - previous > wait) {
        func.apply(context, args);
        previous = now;
      }
    } else if (type === 2) {
      if (!timeout) {
        timeout = setTimeout(() => {
          timeout = null;
          func.apply(context, args)
        }, wait)
      }
    }

  }
}


/**
 * 判断类型
 * @param {*} target 
 */
export function type(target) {
  const ret = typeof (target);
  const template = {
    "[object Array]": "array",
    "[object Object]": "object",
    "[object Number]": "number - object",
    "[object Boolean]": "boolean - object",
    "[object String]": 'string-object'
  };

  if (target === null) {
    return 'null';
  } else if (ret == "object") {
    const str = Object.prototype.toString.call(target);
    return template[str];
  } else {
    return ret;
  }
}

/**
 * 生成指定范围随机数
 * @param { number } min 
 * @param { number } max 
 */
export const RandomNum = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;


/**
 * 数组乱序
 * @param {array} arr
 */
export function arrScrambling(arr) {
  const array = arr;
  let index = array.length;
  while (index) {
    index -= 1;
    const randomIndex = Math.floor(Math.random() * index);
    const middleware = array[index];
    array[index] = array[randomIndex];
    array[randomIndex] = middleware
  }
  return array
}


/**
 * 数组交集
 * @param { array} arr1
 * @param { array } arr2
 */
export const similarity = (arr1, arr2) => arr1.filter(v => arr2.includes(v));


/**
 * 数组中某元素出现的次数
 * @param { array } arr
 * @param {*} value
 */
export function countOccurrences(arr, value) {
  return arr.reduce((a, v) => v === value ? a + 1 : a + 0, 0);
}


/**
 * 递归优化（尾递归）
 * @param { function } f
 */
export function tco(f) {
  let value;
  let active = false;
  const accumulated = [];

  return function accumulator() {
    // @ts-ignore
    // eslint-disable-next-line prefer-rest-params
    accumulated.push(arguments);
    if (!active) {
      active = true;
      while (accumulated.length) {
        value = f.apply(this, accumulated.shift());
      }
      active = false;
      return value;
    }
  };
}


/**
 *  生成随机整数
 *
 */
export function randomNumInteger(min, max) {
  switch (arguments.length) {
    case 1:
      // @ts-ignore
      return parseInt(Math.random() * min + 1, 10);
    case 2:
      return parseInt(Math.random() * (max - min + 1) + min, 10);
    default:
      return 0
  }
}

/**
 * 去除空格
 * @param { string } str 待处理字符串
 * @param  { number } type 去除空格类型 1-所有空格  2-前后空格  3-前空格 4-后空格 默认为1
 */
export function trim(str, type = 1) {
  if (type && type !== 1 && type !== 2 && type !== 3 && type !== 4) return;
  switch (type) {
    case 1:
      return str.replace(/\s/g, "");
    case 2:
      return str.replace(/(^\s)|(\s*$)/g, "");
    case 3:
      return str.replace(/(^\s)/g, "");
    case 4:
      return str.replace(/(\s$)/g, "");
    default:
      return str;
  }
}


/**
 * 大小写转换
 * @param { string } str 待转换的字符串
 * @param { number } type 1-全大写 2-全小写 3-首字母大写 其他-不转换
 */

export function turnCase(str, type) {
  switch (type) {
    case 1:
      return str.toUpperCase();
    case 2:
      return str.toLowerCase();
    case 3:
      return str[0].toUpperCase() + str.substr(1).toLowerCase();
    default:
      return str;
  }
}

/**
 * 随机16进制颜色 hexColor
 * 方法一
 */

export function hexColor() {

  let str = '#';
  const arr = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 'A', 'B', 'C', 'D', 'E', 'F'];
  for (let i = 0; i < 6; i++) {
    const index = Number.parseInt((Math.random() * 16).toString());
    str += arr[index]
  }
  return str;
}
/**
 * 随机16进制颜色 randomHexColorCode
 * 方法二
 */
export const randomHexColorCode = () => {
  const n = (Math.random() * 0xfffff * 1000000).toString(16);
  return '#' + n.slice(0, 6);
};



/**
 * 转义html(防XSS攻击)
 */
export const escapeHTML = str => {
  str.replace(
    /[&<>'"]/g,
    tag =>
      ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        "'": '&#39;',
        '"': '&quot;'
      }[tag] || tag)
  );
};

/**
 * 检测移动/PC设备
 */
export const detectDeviceType = () => { return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ? 'Mobile' : 'Desktop'; };


/**
 * 隐藏所有指定标签
 * 例: hide(document.querySelectorAll('img'))
 */
export const hideTag = (...el) => [...el].forEach(e => (e.style.display = 'none'));


/**
 * 返回指定元素的生效样式
 * @param { element} el  元素节点
 * @param { string } ruleName  指定元素的名称
 */
export const getStyle = (el, ruleName) => getComputedStyle(el)[ruleName];

/**
 * 检查是否包含子元素
 * @param { element } parent
 * @param { element } child
 * 例：elementContains(document.querySelector('head'), document.querySelector('title')); // true
 */
export const elementContains = (parent, child) => parent !== child && parent.contains(child);


/**
 * 数字超过规定大小加上加号“+”，如数字超过99显示99+
 * @param { number } val 输入的数字
 * @param { number } maxNum 数字规定界限
 */
export const outOfNum = (val, maxNum) => {
  val = val ? val - 0 : 0;
  if (val > maxNum) {
    return `${maxNum}+`
  } else {
    return val;
  }
};

/**
 * 计算多个数字或者数组中数字的总和
 * @param { number / array } arr 输入的数字
 *
 */

export const sumNum = (...arr) => [...arr].reduce((acc, val) => acc + val, 0);



/**
 * 将阿拉伯数字翻译成中文的大写数字
 * @param { number } num 
 */
export function numberToChinese(num) {
  const AA = ["零", "一", "二", "三", "四", "五", "六", "七", "八", "九", "十"];
  const BB = ["", "十", "百", "仟", "萬", "億", "点", ""];
  // eslint-disable-next-line prefer-const
  let a = ("" + num).replace(/(^0*)/g, "").split("."),
    k = 0,
    re = "";
  // eslint-disable-next-line no-var
  for (var i = a[0].length - 1; i >= 0; i--) {
    switch (k) {
      case 0:
        re = BB[7] + re;
        break;
      case 4:
        if (!new RegExp("0{4}//d{" + (a[0].length - i - 1) + "}$")
          .test(a[0]))
          re = BB[4] + re;
        break;
      case 8:
        re = BB[5] + re;
        BB[7] = BB[5];
        k = 0;
        break;
    }
    // @ts-ignore
    if (k % 4 == 2 && a[0].charAt(i + 2) != 0 && a[0].charAt(i + 1) == 0)
      re = AA[0] + re;
    // @ts-ignore
    if (a[0].charAt(i) != 0)
      re = AA[a[0].charAt(i)] + BB[k % 4] + re;
    k++;
  }

  if (a.length > 1) // 加上小数部分(如果有小数部分)
  {
    re += BB[6];
    // eslint-disable-next-line no-var
    for (var i = 0; i < a[1].length; i++)
      re += AA[a[1].charAt(i)];
  }
  if (re == '一十')
    re = "十";
  if (re.match(/^一/) && re.length == 3)
    re = re.replace("一", "");
  return re;
}

/**
 * 将数字转换为大写金额
 * @param { number } Num 
 */
export function changeToChinese(Num) {
  //判断如果传递进来的不是字符的话转换为字符
  if (typeof Num == "number") {
    Num = new String(Num);
  }
  Num = Num.replace(/,/g, "") //替换tomoney()中的“,”
  Num = Num.replace(/ /g, "") //替换tomoney()中的空格
  Num = Num.replace(/￥/g, "") //替换掉可能出现的￥字符
  if (isNaN(Num)) { //验证输入的字符是否为数字
    //alert("请检查小写金额是否正确");
    return "";
  }
  //字符处理完毕后开始转换，采用前后两部分分别转换
  const part = String(Num).split(".");
  // eslint-disable-next-line no-var
  var newchar = "";
  //小数点前进行转化
  // eslint-disable-next-line no-var
  for (var i = part[0].length - 1; i >= 0; i--) {
    if (part[0].length > 10) {
      return "";
      //若数量超过拾亿单位，提示
    }
    // eslint-disable-next-line no-var
    var tmpnewchar = ""
    // eslint-disable-next-line no-var
    var perchar = part[0].charAt(i);
    switch (perchar) {
      case "0":
        tmpnewchar = "零" + tmpnewchar;
        break;
      case "1":
        tmpnewchar = "壹" + tmpnewchar;
        break;
      case "2":
        tmpnewchar = "贰" + tmpnewchar;
        break;
      case "3":
        tmpnewchar = "叁" + tmpnewchar;
        break;
      case "4":
        tmpnewchar = "肆" + tmpnewchar;
        break;
      case "5":
        tmpnewchar = "伍" + tmpnewchar;
        break;
      case "6":
        tmpnewchar = "陆" + tmpnewchar;
        break;
      case "7":
        tmpnewchar = "柒" + tmpnewchar;
        break;
      case "8":
        tmpnewchar = "捌" + tmpnewchar;
        break;
      case "9":
        tmpnewchar = "玖" + tmpnewchar;
        break;
    }
    switch (part[0].length - i - 1) {
      case 0:
        tmpnewchar = tmpnewchar + "元";
        break;
      case 1:
        // @ts-ignore
        if (perchar != 0) tmpnewchar = tmpnewchar + "拾";
        break;
      case 2:
        // @ts-ignore
        if (perchar != 0) tmpnewchar = tmpnewchar + "佰";
        break;
      case 3:
        // @ts-ignore
        if (perchar != 0) tmpnewchar = tmpnewchar + "仟";
        break;
      case 4:
        tmpnewchar = tmpnewchar + "万";
        break;
      case 5:
        // @ts-ignore
        if (perchar != 0) tmpnewchar = tmpnewchar + "拾";
        break;
      case 6:
        // @ts-ignore
        if (perchar != 0) tmpnewchar = tmpnewchar + "佰";
        break;
      case 7:
        // @ts-ignore
        if (perchar != 0) tmpnewchar = tmpnewchar + "仟";
        break;
      case 8:
        tmpnewchar = tmpnewchar + "亿";
        break;
      case 9:
        tmpnewchar = tmpnewchar + "拾";
        break;
    }
    // eslint-disable-next-line no-var
    var newchar = tmpnewchar + newchar;
  }
  //小数点之后进行转化
  if (Num.indexOf(".") != -1) {
    if (part[1].length > 2) {
      // alert("小数点之后只能保留两位,系统将自动截断");
      part[1] = part[1].substr(0, 2)
    }
    for (i = 0; i < part[1].length; i++) {
      tmpnewchar = ""
      perchar = part[1].charAt(i)
      switch (perchar) {
        case "0":
          tmpnewchar = "零" + tmpnewchar;
          break;
        case "1":
          tmpnewchar = "壹" + tmpnewchar;
          break;
        case "2":
          tmpnewchar = "贰" + tmpnewchar;
          break;
        case "3":
          tmpnewchar = "叁" + tmpnewchar;
          break;
        case "4":
          tmpnewchar = "肆" + tmpnewchar;
          break;
        case "5":
          tmpnewchar = "伍" + tmpnewchar;
          break;
        case "6":
          tmpnewchar = "陆" + tmpnewchar;
          break;
        case "7":
          tmpnewchar = "柒" + tmpnewchar;
          break;
        case "8":
          tmpnewchar = "捌" + tmpnewchar;
          break;
        case "9":
          tmpnewchar = "玖" + tmpnewchar;
          break;
      }
      if (i == 0) tmpnewchar = tmpnewchar + "角";
      if (i == 1) tmpnewchar = tmpnewchar + "分";
      newchar = newchar + tmpnewchar;
    }
  }
  //替换所有无用汉字
  while (newchar.search("零零") != -1)
    newchar = newchar.replace("零零", "零");
  newchar = newchar.replace("零亿", "亿");
  newchar = newchar.replace("亿万", "亿");
  newchar = newchar.replace("零万", "万");
  newchar = newchar.replace("零元", "元");
  newchar = newchar.replace("零角", "");
  newchar = newchar.replace("零分", "");
  if (newchar.charAt(newchar.length - 1) == "元") {
    newchar = newchar + "整"
  }
  return newchar;
}

/**
 * 根据数组中的某一属性的值（数字）进行升序或降序排序
 * @param { string } property  排序所依赖的属性
 * @param { string } flag  "asc"：升序  "desc": 降序
 * 调用方式：arr.sort(sortCompare('age','asc')); 
 * 这里的 arr 为准备排序的数组
 */
export function sortCompare(property, flag) {
  return function (a, b) {
    const value1 = a[property];
    const value2 = b[property];
    if (flag === "asc") {
      return value1 - value2;
    } else if (flag === "desc") {
      return value2 - value1;
    }
  }
}