const PROBLEMS = [
  {
    id: 1,
    title: "Two Sum",
    difficulty: "Easy",
    tags: ["Array", "Hash Map"],
    description: `Given an array of integers <code>nums</code> and an integer <code>target</code>, return indices of the two numbers that add up to target.
<br><br><b>Example:</b><br>
Input: nums = [2,7,11,15], target = 9<br>
Output: [0, 1]`,
    constraints: ["2 ≤ nums.length ≤ 10⁴", "-10⁹ ≤ nums[i] ≤ 10⁹", "Exactly one solution exists"],
    testCases: [
      { input: "2 7 11 15\n9", expected: "[0, 1]" },
      { input: "3 2 4\n6",     expected: "[1, 2]" },
      { input: "3 3\n6",       expected: "[0, 1]" },
    ],
    templates: {
      python: `def two_sum(nums, target):
    seen = {}
    for i, n in enumerate(nums):
        diff = target - n
        if diff in seen:
            return [seen[diff], i]
        seen[n] = i
    return []

nums = list(map(int, input().split()))
target = int(input())
print(two_sum(nums, target))`,
      java: `import java.util.*;
public class Solution {
    public static int[] twoSum(int[] nums, int target) {
        Map<Integer,Integer> map = new HashMap<>();
        for (int i = 0; i < nums.length; i++) {
            int diff = target - nums[i];
            if (map.containsKey(diff)) return new int[]{map.get(diff), i};
            map.put(nums[i], i);
        }
        return new int[]{};
    }
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int[] nums = Arrays.stream(sc.nextLine().split(" ")).mapToInt(Integer::parseInt).toArray();
        int target = sc.nextInt();
        System.out.println(Arrays.toString(twoSum(nums, target)));
    }
}`,
      javascript: `const lines = require('fs').readFileSync('/dev/stdin','utf8').trim().split('\\n');
const nums = lines[0].split(' ').map(Number);
const target = Number(lines[1]);
const map = new Map();
for (let i = 0; i < nums.length; i++) {
  const diff = target - nums[i];
  if (map.has(diff)) { console.log([map.get(diff), i].toString()); process.exit(); }
  map.set(nums[i], i);
}`,
      c: `#include<stdio.h>
int main(){
    int nums[4]={2,7,11,15}, target, i, j;
    scanf("%d %d %d %d", &nums[0],&nums[1],&nums[2],&nums[3]);
    scanf("%d",&target);
    for(i=0;i<4;i++) for(j=i+1;j<4;j++)
        if(nums[i]+nums[j]==target){ printf("[%d, %d]\\n",i,j); return 0; }
    return 0;
}`,
    },
  },
  {
    id: 2,
    title: "Reverse String",
    difficulty: "Easy",
    tags: ["String", "Two Pointer"],
    description: `Write a function that reverses a string and returns it.
<br><br><b>Example:</b><br>
Input: "hello"<br>
Output: "olleh"`,
    constraints: ["1 ≤ s.length ≤ 10⁵", "s consists of printable ASCII characters"],
    testCases: [
      { input: "hello",  expected: "olleh" },
      { input: "Hannah", expected: "hannaH" },
      { input: "abcde",  expected: "edcba" },
    ],
    templates: {
      python: `s = input().strip()
print(s[::-1])`,
      java: `import java.util.*;
public class Solution {
    public static void main(String[] args) {
        String s = new Scanner(System.in).nextLine().trim();
        System.out.println(new StringBuilder(s).reverse().toString());
    }
}`,
      javascript: `const s = require('fs').readFileSync('/dev/stdin','utf8').trim();
console.log(s.split('').reverse().join(''));`,
      c: `#include<stdio.h>
#include<string.h>
int main(){
    char s[1000]; scanf("%s",s);
    int n=strlen(s);
    for(int i=0;i<n/2;i++){char t=s[i];s[i]=s[n-1-i];s[n-1-i]=t;}
    printf("%s\\n",s);
}`,
    },
  },
  {
    id: 3,
    title: "Fibonacci Number",
    difficulty: "Easy",
    tags: ["Recursion", "DP"],
    description: `Given <code>n</code>, return the nth Fibonacci number.<br>
F(0) = 0, F(1) = 1, F(n) = F(n-1) + F(n-2).
<br><br><b>Example:</b><br>
Input: 10<br>
Output: 55`,
    constraints: ["0 ≤ n ≤ 30"],
    testCases: [
      { input: "0",  expected: "0" },
      { input: "5",  expected: "5" },
      { input: "10", expected: "55" },
    ],
    templates: {
      python: `n = int(input())
a, b = 0, 1
for _ in range(n):
    a, b = b, a + b
print(a)`,
      java: `import java.util.*;
public class Solution {
    public static void main(String[] args) {
        int n = new Scanner(System.in).nextInt();
        int a=0,b=1;
        for(int i=0;i<n;i++){int t=a+b;a=b;b=t;}
        System.out.println(a);
    }
}`,
      javascript: `const n = parseInt(require('fs').readFileSync('/dev/stdin','utf8').trim());
let a=0,b=1;
for(let i=0;i<n;i++){[a,b]=[b,a+b];}
console.log(a);`,
      c: `#include<stdio.h>
int main(){
    int n; scanf("%d",&n);
    int a=0,b=1;
    for(int i=0;i<n;i++){int t=a+b;a=b;b=t;}
    printf("%d\\n",a);
}`,
    },
  },
  {
    id: 4,
    title: "Valid Palindrome",
    difficulty: "Easy",
    tags: ["String", "Two Pointer"],
    description: `A phrase is a palindrome if it reads the same forward and backward ignoring case and non-alphanumeric characters. Return <code>true</code> or <code>false</code>.
<br><br><b>Example:</b><br>
Input: "racecar"<br>
Output: true`,
    constraints: ["1 ≤ s.length ≤ 2 × 10⁵", "s consists of printable ASCII"],
    testCases: [
      { input: "racecar",                     expected: "true" },
      { input: "hello",                       expected: "false" },
      { input: "A man a plan a canal Panama", expected: "true" },
    ],
    templates: {
      python: `s = input().strip().lower()
clean = ''.join(c for c in s if c.isalnum())
print(str(clean == clean[::-1]).lower())`,
      java: `import java.util.*;
public class Solution {
    public static void main(String[] args) {
        String s = new Scanner(System.in).nextLine().toLowerCase().replaceAll("[^a-z0-9]","");
        System.out.println(s.equals(new StringBuilder(s).reverse().toString()));
    }
}`,
      javascript: `const s=require('fs').readFileSync('/dev/stdin','utf8').trim().toLowerCase().replace(/[^a-z0-9]/g,'');
console.log(s===s.split('').reverse().join(''));`,
      c: `#include<stdio.h>
#include<string.h>
#include<ctype.h>
int main(){
    char s[1000]; fgets(s,1000,stdin);
    int n=strlen(s),i=0,j=n-1;
    while(j>0&&!isalnum(s[j]))j--;
    while(i<j){
        while(i<j&&!isalnum(s[i]))i++;
        while(i<j&&!isalnum(s[j]))j--;
        if(tolower(s[i])!=tolower(s[j])){puts("false");return 0;}
        i++;j--;
    }
    puts("true");
}`,
    },
  },
  {
    id: 5,
    title: "Maximum Subarray",
    difficulty: "Medium",
    tags: ["DP", "Kadane's"],
    description: `Given an integer array <code>nums</code>, find the subarray with the largest sum and return its sum.
<br><br><b>Example:</b><br>
Input: [-2,1,-3,4,-1,2,1,-5,4]<br>
Output: 6`,
    constraints: ["1 ≤ nums.length ≤ 10⁵", "-10⁴ ≤ nums[i] ≤ 10⁴"],
    testCases: [
      { input: "-2 1 -3 4 -1 2 1 -5 4", expected: "6" },
      { input: "1",                      expected: "1" },
      { input: "5 4 -1 7 8",             expected: "23" },
    ],
    templates: {
      python: `nums = list(map(int, input().split()))
max_sum = cur = nums[0]
for n in nums[1:]:
    cur = max(n, cur + n)
    max_sum = max(max_sum, cur)
print(max_sum)`,
      java: `import java.util.*;
public class Solution {
    public static void main(String[] args) {
        int[] nums = Arrays.stream(new Scanner(System.in).nextLine().split(" ")).mapToInt(Integer::parseInt).toArray();
        int maxSum=nums[0],cur=nums[0];
        for(int i=1;i<nums.length;i++){cur=Math.max(nums[i],cur+nums[i]);maxSum=Math.max(maxSum,cur);}
        System.out.println(maxSum);
    }
}`,
      javascript: `const nums=require('fs').readFileSync('/dev/stdin','utf8').trim().split(' ').map(Number);
let maxSum=nums[0],cur=nums[0];
for(let i=1;i<nums.length;i++){cur=Math.max(nums[i],cur+nums[i]);maxSum=Math.max(maxSum,cur);}
console.log(maxSum);`,
      c: `#include<stdio.h>
int main(){
    int a[1000],n=0;
    while(scanf("%d",&a[n])==1)n++;
    int mx=a[0],cur=a[0];
    for(int i=1;i<n;i++){cur=cur+a[i]>a[i]?cur+a[i]:a[i];mx=mx>cur?mx:cur;}
    printf("%d\\n",mx);
}`,
    },
  },
];

if (typeof module !== "undefined") module.exports = PROBLEMS;
