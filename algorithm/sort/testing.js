// 生成一个测试用例的函数返回一个整型数组
function generateTestCase() {
  const arr = [];
  for (let i = 0; i < 8; i++) {
    arr.push(Math.floor(Math.random() * 100));
  }
  return arr;
}

// 1.生成一个冒泡排序带注释的函数
// 选择排序的原理是 每次都从未排序的数组中找到最小的元素，然后放到已排序数组的末尾
function bubbleSort(arr) {
  // 1.1.定义一个变量，用来标识是否进行过交换
  let flag = false;
  // 1.2.外层循环，表示要走多少趟
  for (let i = 0; i < arr.length - 1; i++) {
    // 1.3.内层循环，用来比较两个元素
    for (let j = 0; j < arr.length - 1 - i; j++) {
      // 1.4.判断两个元素是否需要交换位置
      if (arr[j] > arr[j + 1]) {
        // 1.5.交换位置
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
        // 1.6.标识进行过交换
        flag = true;
      }
    }
    // 1.7.判断是否进行过交换
    if (!flag) {
      // 1.8.如果没有交换过，说明数组已经是有序的了，就没必要再进行下去了，直接结束循环
      break;
    }
    // 1.9.重置标识
    flag = false;
  }
  // 1.10.返回排序后的数组
  return arr;
}
console.log(bubbleSort(generateTestCase()));

// 2.选择排序
// 选择排序的原理是 每次都从未排序的数组中找到最小的元素，然后放到已排序数组的末尾
function selectionSort(arr) {
  // 2.1.外层循环，表示要走多少趟
  for (let i = 0; i < arr.length - 1; i++) {
    // 2.2.定义一个变量，用来保存最小值的索引，默认值为外层循环的索引
    let minIndex = i;
    // 2.3.内层循环，用来比较两个元素
    for (let j = i + 1; j < arr.length; j++) {
      // 2.4.判断两个元素的大小
      if (arr[minIndex] > arr[j]) {
        // 2.5.如果后面的元素更小，就更新最小值的索引
        minIndex = j;
      }
    }
    // 2.6.判断最小值的索引是否发生过改变
    if (minIndex !== i) {
      // 2.7.交换位置
      [arr[i], arr[minIndex]] = [arr[minIndex], arr[i]];
    }
  }
  // 2.8.返回排序后的数组
  return arr;
}
console.log(selectionSort(generateTestCase()));

// 3.插入排序
// 插入排序的原理是 将数组中的所有元素依次与前面已排好序的元素相比较，然后插入到合适的位置
function insertionSort(arr) {
  // 3.1.外层循环，表示要插入多少个数
  for (let i = 1; i < arr.length; i++) {
    // 3.2.定义一个变量，用来保存当前要插入的数
    let temp = arr[i];
    // 3.3.内层循环，用来找到插入的位置
    let j = i;
    while (j > 0 && arr[j - 1] > temp) {
      // 3.4.判断当前元素是否比插入的元素大
      // 3.5.如果是，就将当前元素向后移动一位
      arr[j] = arr[j - 1];
      // 3.6.继续向前比较
      j--;
    }
    // 3.7.将元素插入到指定位置
    arr[j] = temp;
  }
  // 3.8.返回排序后的数组
  return arr;
}
console.log(insertionSort(generateTestCase()));

// 4.希尔排序
// 哈希排序的原理是 将数组按照一定的间隔分为多个子数组，然后对每个子数组进行插入排序，间隔会依次缩小，直到为1
function shellSort(arr) {
  // 4.1.定义一个变量，用来保存间隔的值
  let gap = Math.floor(arr.length / 2);
  // 4.2.外层循环，表示要走多少趟
  while (gap >= 1) {
    // 4.3.内层循环，用来比较两个元素
    for (let i = gap; i < arr.length; i++) {
      // 4.4.定义一个变量，用来保存当前要插入的数
      let temp = arr[i];
      // 4.5.内层循环，用来找到插入的位置
      let j = i;
      while (j > 0 && arr[j - gap] > temp) {
        // 4.6.判断当前元素是否比插入的元素大
        // 4.7.如果是，就将当前元素向后移动 gap 位
        arr[j] = arr[j - gap];
        // 4.8.继续向前比较
        j -= gap;
      }
      // 4.9.将元素插入到指定位置
      arr[j] = temp;
    }
    // 4.10.重新计算间隔的值
    gap = Math.floor(gap / 2);
  }
  // 4.11.返回排序后的数组
  return arr;
}
console.log(shellSort(generateTestCase()));

// 5.归并排序
// 归并排序的原理是 将数组从中间分成前后两部分，然后对前后两部分分别进行排序，再将排好序的两部分合并在一起
function mergeSort(arr) {
  // 5.1.判断数组的长度是否为1
  if (arr.length === 1) {
    // 5.2.如果是，直接返回
    return arr;
  }
  // 5.3.定义一个变量，用来保存数组长度的一半
  const mid = Math.floor(arr.length / 2);
  // 5.4.定义变量，用来保存左边的数组
  const left = arr.slice(0, mid);
  // 5.5.定义变量，用来保存右边的数组
  const right = arr.slice(mid);
  // 5.6.递归分别对左右两边的数组进行排序
  return merge(mergeSort(left), mergeSort(right));
}
// 5.7.定义一个函数，用来合并两个有序数组
function merge(left, right) {
  // 5.8.定义一个变量，用来保存合并后的数组
  let result = [];
  // 5.9.定义两个变量，分别表示左右两个数组的索引
  let i = 0;
  let j = 0;
  // 5.10.比较两个数组的元素，将较小的元素添加到结果数组中
  while (i < left.length && j < right.length) {
    result.push(left[i] < right[j] ? left[i++] : right[j++]);
  }
  // 5.11.将剩余的元素添加到结果数组中
  return result.concat(i < left.length ? left.slice(i) : right.slice(j));
}
console.log(mergeSort(generateTestCase()));


// 6.快速排序
// 7.堆排序
// 8.计数排序
// 9.桶排序
// 10.基数排序
// 11.二分查找
// 12.深度优先搜索
// 13.广度优先搜索
// 14.动态规划
// 15.贪心算法
// 16.回溯算法
// 17.分治算法
// 18.位运算
// 19.布隆过滤器
// 20.LRU缓存
// 21.排序算法
// 22.二叉树
// 23.二叉搜索树
// 24.平衡二叉搜索树
// 25.红黑树
// 26.B树
// 27.B+树
// 28.哈希表
// 29.图
// 30.栈
// 31.队列
// 32.堆
// 33.链表
// 34.数组
// 35.矩阵
// 36.字符串
// 37.树
// 38.递归
// 44.双指针
// 45.位运算
// 46.滑动窗口
// 48.双端队列
// 51.并查集
// 52.字典树
// 53.线段树
// 54.树状数组
// 55.布隆过滤器

