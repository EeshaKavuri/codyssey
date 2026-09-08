export type Difficulty = 'Basic' | 'Easy' | 'Medium' | 'Hard'

export type DsaProblem = {
  title: string
  source: string
  difficulty: Difficulty
  url?: string
}

export type DsaPattern = {
  name: string
  week: number
  learningOrder?: number
  problems: DsaProblem[]
}

export const dsaPatterns: DsaPattern[] = [
  {
    "name": "Doubly Linked Lists",
    "week": 1,
    "learningOrder": 6,
    "problems": [
      {
        "title": "Introduction to DLL, learn about struct, and how is node represented",
        "source": "tuf",
        "difficulty": "Easy",
        "url": "https://takeuforward.org/plus/dsa/problems/introduction-to-doubly-ll"
      },
      {
        "title": "Insert a node in DLL",
        "source": "tuf",
        "difficulty": "Easy",
        "url": "https://takeuforward.org/plus/dsa/problems/insert-node-before-head-in-dll"
      },
      {
        "title": "Find pairs with given sum in DLL",
        "source": "tuf",
        "difficulty": "Easy",
        "url": "https://takeuforward.org/plus/dsa/problems/find-pairs-with-given-sum-in-doubly-linked-list"
      }
    ]
  },
  {
    "name": "Fast and Slow Pointer",
    "week": 1,
    "learningOrder": 4,
    "problems": [
      {
        "title": "Middle of a LinkedList [TortoiseHare Method]",
        "source": "leetcode",
        "difficulty": "Easy",
        "url": "https://leetcode.com/problems/middle-of-the-linked-list"
      },
      {
        "title": "Detect a loop in LL",
        "source": "leetcode",
        "difficulty": "Easy",
        "url": "https://leetcode.com/problems/linked-list-cycle"
      },
      {
        "title": "Length of Loop in LL",
        "source": "tuf",
        "difficulty": "Medium",
        "url": "https://takeuforward.org/plus/dsa/problems/length-of-loop-in-ll"
      },
      {
        "title": "Delete the middle node of LL",
        "source": "leetcode",
        "difficulty": "Medium",
        "url": "https://leetcode.com/problems/delete-the-middle-node-of-a-linked-list"
      },
      {
        "title": "Find the intersection point of Y LL",
        "source": "leetcode",
        "difficulty": "Easy",
        "url": "https://leetcode.com/problems/intersection-of-two-linked-lists"
      }
    ]
  },
  {
    "name": "Linked List Fundamentals",
    "week": 1,
    "learningOrder": 3,
    "problems": [
      {
        "title": "Introduction to LinkedList, learn about struct, and how is node represented",
        "source": "tuf",
        "difficulty": "Easy",
        "url": "https://takeuforward.org/linked-list/linked-list-introduction"
      },
      {
        "title": "Inserting a node in LinkedList",
        "source": "tuf",
        "difficulty": "Basic",
        "url": "https://takeuforward.org/plus/dsa/problems/insertion-at-the-head-of-ll"
      },
      {
        "title": "Deleting a node in LinkedList",
        "source": "leetcode",
        "difficulty": "Medium",
        "url": "https://leetcode.com/problems/delete-node-in-a-linked-list"
      },
      {
        "title": "Find the length of the linkedlist [learn traversal]",
        "source": "tuf",
        "difficulty": "Basic",
        "url": "https://takeuforward.org/plus/dsa/problems/find-the-length-of-the-linked-list"
      },
      {
        "title": "Search an element in the LL",
        "source": "tuf",
        "difficulty": "Easy",
        "url": "https://takeuforward.org/plus/dsa/problems/search-in-linked-list"
      },
      {
        "title": "Find the starting point in LL",
        "source": "leetcode",
        "difficulty": "Medium",
        "url": "https://leetcode.com/problems/linked-list-cycle-ii"
      },
      {
        "title": "Check if LL is palindrome or not",
        "source": "leetcode",
        "difficulty": "Easy",
        "url": "https://leetcode.com/problems/palindrome-linked-list"
      },
      {
        "title": "Segrregate odd and even nodes in LL",
        "source": "leetcode",
        "difficulty": "Medium",
        "url": "https://leetcode.com/problems/odd-even-linked-list"
      },
      {
        "title": "Add 1 to a number represented by LL",
        "source": "tuf",
        "difficulty": "Medium",
        "url": "https://takeuforward.org/plus/dsa/problems/add-one-to-a-number-represented-by-ll\\\\"
      },
      {
        "title": "Add 2 numbers in LL",
        "source": "leetcode",
        "difficulty": "Medium",
        "url": "https://leetcode.com/problems/add-two-numbers"
      }
    ]
  },
  {
    "name": "Linked List Merge and Transformation",
    "week": 1,
    "learningOrder": 5,
    "problems": [
      {
        "title": "Sort LL",
        "source": "leetcode",
        "difficulty": "Medium",
        "url": "https://leetcode.com/problems/sort-list"
      },
      {
        "title": "Sort a LL of 0's 1's and 2's by changing links",
        "source": "tuf",
        "difficulty": "Medium",
        "url": "https://takeuforward.org/plus/dsa/problems/sort-a-ll-of-0's-1's-and-2's"
      },
      {
        "title": "Flattening of LL",
        "source": "tuf",
        "difficulty": "Medium",
        "url": "https://takeuforward.org/plus/dsa/problems/flattening-of-ll"
      },
      {
        "title": "Clone a Linked List with random and next pointer",
        "source": "leetcode",
        "difficulty": "Medium",
        "url": "https://leetcode.com/problems/copy-list-with-random-pointer"
      }
    ]
  },
  {
    "name": "Linked List Pointer Rewiring",
    "week": 1,
    "learningOrder": 7,
    "problems": [
      {
        "title": "Delete a node in DLL",
        "source": "tuf",
        "difficulty": "Easy",
        "url": "https://takeuforward.org/plus/dsa/problems/delete-head-of-dll"
      },
      {
        "title": "Reverse a DLL",
        "source": "tuf",
        "difficulty": "Easy",
        "url": "https://takeuforward.org/plus/dsa/problems/reverse-a-doubly-linked-list"
      },
      {
        "title": "Reverse a LinkedList [Iterative]",
        "source": "leetcode",
        "difficulty": "Easy",
        "url": "https://leetcode.com/problems/reverse-linked-list"
      },
      {
        "title": "Reverse a LL [Recursive]",
        "source": "leetcode",
        "difficulty": "Easy",
        "url": "https://leetcode.com/problems/reverse-linked-list"
      },
      {
        "title": "Remove Nth node from the back of the LL",
        "source": "leetcode",
        "difficulty": "Medium",
        "url": "https://leetcode.com/problems/remove-nth-node-from-end-of-list"
      },
      {
        "title": "Delete all occurrences of a key in DLL",
        "source": "tuf",
        "difficulty": "Medium",
        "url": "https://takeuforward.org/plus/dsa/problems/delete-all-occurrences-of-a-key-in-dll"
      },
      {
        "title": "Remove duplicates from sorted DLL",
        "source": "tuf",
        "difficulty": "Easy",
        "url": "https://takeuforward.org/plus/dsa/problems/remove-duplicated-from-sorted-dll"
      },
      {
        "title": "Reverse LL in group of given size K",
        "source": "leetcode",
        "difficulty": "Hard",
        "url": "https://leetcode.com/problems/reverse-nodes-in-k-group"
      },
      {
        "title": "Rotate a LL",
        "source": "leetcode",
        "difficulty": "Medium",
        "url": "https://leetcode.com/problems/rotate-list"
      }
    ]
  },
  {
    "name": "Programming and Complexity Basics",
    "week": 1,
    "learningOrder": 1,
    "problems": [
      {
        "title": "User Input / Output",
        "source": "tuf",
        "difficulty": "Basic",
        "url": "https://takeuforward.org/plus/dsa/problems/input-output"
      },
      {
        "title": "Data Types",
        "source": "tuf",
        "difficulty": "Basic",
        "url": "https://takeuforward.org/data-structure/data-types"
      },
      {
        "title": "If Else statements",
        "source": "tuf",
        "difficulty": "Basic",
        "url": "https://takeuforward.org/plus/dsa/problems/if-elseif"
      },
      {
        "title": "Switch Statement",
        "source": "tuf",
        "difficulty": "Basic",
        "url": "https://takeuforward.org/plus/dsa/problems/switch-case"
      },
      {
        "title": "For loops",
        "source": "tuf",
        "difficulty": "Easy",
        "url": "https://takeuforward.org/for-loop/understanding-for-loop/"
      },
      {
        "title": "While loops",
        "source": "tuf",
        "difficulty": "Easy",
        "url": "https://takeuforward.org/while-loop/while-loops-in-programming/"
      },
      {
        "title": "Functions (Pass by Reference and Value)",
        "source": "hackerrank",
        "difficulty": "Easy",
        "url": "https://www.hackerrank.com/challenges/c-tutorial-functions/problem?isFullScreen=true"
      },
      {
        "title": "What are arrays, strings?",
        "source": "tuf",
        "difficulty": "Easy",
        "url": "https://takeuforward.org/plus/dsa/problems/cpp"
      },
      {
        "title": "Time Complexity [Learn Basics, and then analyse in next Steps]",
        "source": "tuf",
        "difficulty": "Easy",
        "url": "https://takeuforward.org/time-complexity/time-and-space-complexity-strivers-a2z-dsa-course/"
      },
      {
        "title": "Patterns",
        "source": "tuf",
        "difficulty": "Easy",
        "url": "https://takeuforward.org/strivers-a2z-dsa-course/must-do-pattern-problems-before-starting-dsa/"
      }
    ]
  },
  {
    "name": "Python Collections",
    "week": 1,
    "learningOrder": 2,
    "problems": [
      {
        "title": "C++ STL",
        "source": "tuf",
        "difficulty": "Medium",
        "url": "https://takeuforward.org/c/c-stl-tutorial-most-frequent-used-stl-containers/"
      },
      {
        "title": "Java Collections",
        "source": "tuf",
        "difficulty": "Easy"
      }
    ]
  },
  {
    "name": "Array Fundamentals",
    "week": 2,
    "problems": [
      {
        "title": "Largest Element in an Array",
        "source": "tuf",
        "difficulty": "Basic",
        "url": "https://takeuforward.org/plus/dsa/problems/largest-element"
      },
      {
        "title": "Second Largest Element in an Array without sorting",
        "source": "tuf",
        "difficulty": "Easy",
        "url": "https://takeuforward.org/plus/dsa/problems/second-largest-element"
      },
      {
        "title": "Check if the array is sorted",
        "source": "leetcode",
        "difficulty": "Easy",
        "url": "https://leetcode.com/problems/check-if-array-is-sorted-and-rotated"
      },
      {
        "title": "Left Rotate an array by one place",
        "source": "leetcode",
        "difficulty": "Medium",
        "url": "https://leetcode.com/problems/rotate-array"
      },
      {
        "title": "Left rotate an array by D places",
        "source": "leetcode",
        "difficulty": "Medium",
        "url": "https://leetcode.com/problems/rotate-array"
      },
      {
        "title": "Move Zeros to end",
        "source": "leetcode",
        "difficulty": "Easy",
        "url": "https://leetcode.com/problems/move-zeroes"
      },
      {
        "title": "Linear Search",
        "source": "tuf",
        "difficulty": "Basic",
        "url": "https://takeuforward.org/plus/dsa/problems/linear-search"
      },
      {
        "title": "Maximum Consecutive Ones",
        "source": "leetcode",
        "difficulty": "Easy",
        "url": "https://leetcode.com/problems/max-consecutive-ones"
      },
      {
        "title": "Sort an array of 0's 1's and 2's",
        "source": "leetcode",
        "difficulty": "Medium",
        "url": "https://leetcode.com/problems/sort-colors"
      },
      {
        "title": "Rearrange the array in alternating positive and negative items",
        "source": "leetcode",
        "difficulty": "Medium",
        "url": "https://leetcode.com/problems/rearrange-array-elements-by-sign"
      },
      {
        "title": "Next Permutation",
        "source": "leetcode",
        "difficulty": "Medium",
        "url": "https://leetcode.com/problems/next-permutation"
      },
      {
        "title": "Leaders in an Array problem",
        "source": "tuf",
        "difficulty": "Easy",
        "url": "https://takeuforward.org/plus/dsa/problems/leaders-in-an-array"
      },
      {
        "title": "Longest Consecutive Sequence in an Array",
        "source": "leetcode",
        "difficulty": "Medium",
        "url": "https://leetcode.com/problems/longest-consecutive-sequence"
      },
      {
        "title": "Pascal's Triangle",
        "source": "leetcode",
        "difficulty": "Easy",
        "url": "https://leetcode.com/problems/pascals-triangle"
      },
      {
        "title": "3-Sum Problem",
        "source": "leetcode",
        "difficulty": "Medium",
        "url": "https://leetcode.com/problems/3sum"
      },
      {
        "title": "4-Sum Problem",
        "source": "leetcode",
        "difficulty": "Medium",
        "url": "https://leetcode.com/problems/4sum"
      },
      {
        "title": "Merge two sorted arrays without extra space",
        "source": "leetcode",
        "difficulty": "Easy",
        "url": "https://leetcode.com/problems/merge-sorted-array"
      },
      {
        "title": "Count Inversions",
        "source": "tuf",
        "difficulty": "Medium",
        "url": "https://takeuforward.org/plus/dsa/problems/count-inversions"
      },
      {
        "title": "Reverse Pairs",
        "source": "leetcode",
        "difficulty": "Hard",
        "url": "https://leetcode.com/problems/reverse-pairs"
      }
    ]
  },
  {
    "name": "Kadane and Running State",
    "week": 2,
    "problems": [
      {
        "title": "Kadane's Algorithm, maximum subarray sum",
        "source": "leetcode",
        "difficulty": "Medium",
        "url": "https://leetcode.com/problems/maximum-subarray"
      },
      {
        "title": "Print subarray with maximum subarray sum (extended version of above problem)",
        "source": "tuf",
        "difficulty": "Medium",
        "url": "https://takeuforward.org/plus/dsa/problems/kadane's-algorithm"
      },
      {
        "title": "Stock Buy and Sell",
        "source": "leetcode",
        "difficulty": "Easy",
        "url": "https://leetcode.com/problems/best-time-to-buy-and-sell-stock"
      }
    ]
  },
  {
    "name": "Matrix Traversal and Transformation",
    "week": 2,
    "problems": [
      {
        "title": "Set Matrix Zeros",
        "source": "leetcode",
        "difficulty": "Medium",
        "url": "https://leetcode.com/problems/set-matrix-zeroes"
      },
      {
        "title": "Rotate Matrix by 90 degrees",
        "source": "leetcode",
        "difficulty": "Medium",
        "url": "https://leetcode.com/problems/rotate-image"
      },
      {
        "title": "Print the matrix in spiral manner",
        "source": "leetcode",
        "difficulty": "Medium",
        "url": "https://leetcode.com/problems/spiral-matrix"
      }
    ]
  },
  {
    "name": "String Manipulation and Palindromes",
    "week": 2,
    "problems": [
      {
        "title": "Reverse words in a given string / Palindrome Check",
        "source": "leetcode",
        "difficulty": "Medium",
        "url": "https://leetcode.com/problems/reverse-words-in-a-string"
      },
      {
        "title": "Reverse Every Word in A String",
        "source": "leetcode",
        "difficulty": "Medium",
        "url": "https://leetcode.com/problems/reverse-words-in-a-string"
      }
    ]
  },
  {
    "name": "String Parsing and Transformation",
    "week": 2,
    "problems": [
      {
        "title": "Remove outermost Paranthesis",
        "source": "leetcode",
        "difficulty": "Easy",
        "url": "https://leetcode.com/problems/remove-outermost-parentheses"
      },
      {
        "title": "Largest odd number in a string",
        "source": "leetcode",
        "difficulty": "Easy",
        "url": "https://leetcode.com/problems/largest-odd-number-in-string"
      },
      {
        "title": "Longest Common Prefix",
        "source": "leetcode",
        "difficulty": "Easy",
        "url": "https://leetcode.com/problems/longest-common-prefix"
      },
      {
        "title": "check whether one string is a rotation of another",
        "source": "leetcode",
        "difficulty": "Easy",
        "url": "https://leetcode.com/problems/rotate-string"
      },
      {
        "title": "Maximum Nesting Depth of Paranthesis",
        "source": "leetcode",
        "difficulty": "Easy",
        "url": "https://leetcode.com/problems/maximum-nesting-depth-of-the-parentheses"
      },
      {
        "title": "Roman Number to Integer and vice versa",
        "source": "leetcode",
        "difficulty": "Easy",
        "url": "https://leetcode.com/problems/roman-to-integer"
      },
      {
        "title": "Implement Atoi",
        "source": "leetcode",
        "difficulty": "Medium",
        "url": "https://leetcode.com/problems/string-to-integer-atoi"
      },
      {
        "title": "Count Number of Substrings",
        "source": "leetcode",
        "difficulty": "Hard",
        "url": "https://leetcode.com/problems/subarrays-with-k-different-integers"
      },
      {
        "title": "Longest Palindromic Substring[Do it without DP]",
        "source": "leetcode",
        "difficulty": "Medium",
        "url": "https://leetcode.com/problems/longest-palindromic-substring"
      },
      {
        "title": "Sum of Beauty of all substring",
        "source": "leetcode",
        "difficulty": "Medium",
        "url": "https://leetcode.com/problems/sum-of-beauty-of-all-substrings"
      },
      {
        "title": "Count and say",
        "source": "leetcode",
        "difficulty": "Medium",
        "url": "https://leetcode.com/problems/count-and-say"
      }
    ]
  },
  {
    "name": "Two Pointers and Hashing",
    "week": 2,
    "problems": [
      {
        "title": "2Sum Problem",
        "source": "leetcode",
        "difficulty": "Easy",
        "url": "https://leetcode.com/problems/two-sum"
      }
    ]
  },
  {
    "name": "Expression Parsing with Stacks",
    "week": 3,
    "problems": [
      {
        "title": "Infix to Postfix Conversion using Stack",
        "source": "tuf",
        "difficulty": "Medium",
        "url": "https://takeuforward.org/plus/dsa/problems/infix-to-postfix-conversion"
      },
      {
        "title": "Prefix to Infix Conversion",
        "source": "tuf",
        "difficulty": "Medium",
        "url": "https://takeuforward.org/plus/dsa/problems/prefix-to-infix-conversion"
      },
      {
        "title": "Prefix to Postfix Conversion",
        "source": "tuf",
        "difficulty": "Medium",
        "url": "https://takeuforward.org/plus/dsa/problems/prefix-to-postfix-conversion"
      },
      {
        "title": "Postfix to Prefix Conversion",
        "source": "tuf",
        "difficulty": "Medium",
        "url": "https://takeuforward.org/plus/dsa/problems/postfix-to-prefix-conversion"
      },
      {
        "title": "Postfix to Infix",
        "source": "hackerrank",
        "difficulty": "Easy",
        "url": "https://www.hackerrank.com/contests/ds-day-10/challenges/ques-14-d10/problem"
      },
      {
        "title": "Convert Infix To Prefix Notation",
        "source": "tuf",
        "difficulty": "Medium",
        "url": "https://takeuforward.org/plus/dsa/problems/infix-to-postfix-conversion"
      },
      {
        "title": "Minimum number of bracket reversals needed to make an expression balanced",
        "source": "leetcode",
        "difficulty": "Medium",
        "url": "https://leetcode.com/problems/minimum-add-to-make-parentheses-valid"
      }
    ]
  },
  {
    "name": "Monotonic Stack and Queue",
    "week": 3,
    "problems": [
      {
        "title": "Next Greater Element",
        "source": "leetcode",
        "difficulty": "Easy",
        "url": "https://leetcode.com/problems/next-greater-element-i"
      },
      {
        "title": "Next Greater Element 2",
        "source": "leetcode",
        "difficulty": "Medium",
        "url": "https://leetcode.com/problems/next-greater-element-ii"
      },
      {
        "title": "Next Smaller Element",
        "source": "interviewbit",
        "difficulty": "Easy",
        "url": "https://www.interviewbit.com/problems/nearest-smaller-element"
      },
      {
        "title": "Number of NGEs to the right",
        "source": "tuf",
        "difficulty": "Medium",
        "url": "https://takeuforward.org/plus/dsa/problems/number-of-greater-elements-to-the-right"
      },
      {
        "title": "Trapping Rainwater",
        "source": "leetcode",
        "difficulty": "Hard",
        "url": "https://leetcode.com/problems/trapping-rain-water"
      },
      {
        "title": "Sum of subarray minimum",
        "source": "leetcode",
        "difficulty": "Medium",
        "url": "https://leetcode.com/problems/sum-of-subarray-minimums"
      },
      {
        "title": "Asteroid Collision",
        "source": "leetcode",
        "difficulty": "Medium",
        "url": "https://leetcode.com/problems/asteroid-collision"
      },
      {
        "title": "Sum of subarray ranges",
        "source": "leetcode",
        "difficulty": "Medium",
        "url": "https://leetcode.com/problems/sum-of-subarray-ranges"
      },
      {
        "title": "Remove k Digits",
        "source": "leetcode",
        "difficulty": "Medium",
        "url": "https://leetcode.com/problems/remove-k-digits"
      },
      {
        "title": "Largest rectangle in a histogram",
        "source": "leetcode",
        "difficulty": "Hard",
        "url": "https://leetcode.com/problems/largest-rectangle-in-histogram"
      },
      {
        "title": "Maximal Rectangles",
        "source": "leetcode",
        "difficulty": "Hard",
        "url": "https://leetcode.com/problems/maximal-rectangle"
      }
    ]
  },
  {
    "name": "Stack and Queue Fundamentals",
    "week": 3,
    "problems": [
      {
        "title": "Implement Stack using Arrays",
        "source": "tuf",
        "difficulty": "Easy",
        "url": "https://takeuforward.org/plus/dsa/problems/implement-stack-using-arrays"
      },
      {
        "title": "Implement Queue using Arrays",
        "source": "tuf",
        "difficulty": "Basic",
        "url": "https://takeuforward.org/plus/dsa/problems/implement-queue-using-arrays"
      },
      {
        "title": "Implement Stack using Queue",
        "source": "leetcode",
        "difficulty": "Easy",
        "url": "https://leetcode.com/problems/implement-stack-using-queues"
      },
      {
        "title": "Implement Queue using Stack",
        "source": "leetcode",
        "difficulty": "Easy",
        "url": "https://leetcode.com/problems/implement-queue-using-stacks"
      },
      {
        "title": "Implement stack using Linkedlist",
        "source": "tuf",
        "difficulty": "Easy",
        "url": "https://takeuforward.org/plus/dsa/problems/implement-stack-using-linkedlist"
      },
      {
        "title": "Implement queue using Linkedlist",
        "source": "tuf",
        "difficulty": "Basic",
        "url": "https://takeuforward.org/plus/dsa/problems/implement-queue-using-linkedlist"
      },
      {
        "title": "Check for balanced paranthesis",
        "source": "leetcode",
        "difficulty": "Easy",
        "url": "https://leetcode.com/problems/valid-parentheses"
      },
      {
        "title": "Implement Min Stack",
        "source": "leetcode",
        "difficulty": "Medium",
        "url": "https://leetcode.com/problems/min-stack"
      }
    ]
  },
  {
    "name": "Stack, Queue and Cache Design",
    "week": 3,
    "problems": [
      {
        "title": "Sliding Window maximum",
        "source": "leetcode",
        "difficulty": "Hard",
        "url": "https://leetcode.com/problems/sliding-window-maximum"
      },
      {
        "title": "Stock span problem",
        "source": "leetcode",
        "difficulty": "Medium",
        "url": "https://leetcode.com/problems/online-stock-span"
      },
      {
        "title": "The Celebrity Problem",
        "source": "tuf",
        "difficulty": "Medium",
        "url": "https://takeuforward.org/plus/dsa/problems/word-break"
      },
      {
        "title": "LRU cache (IMPORTANT)",
        "source": "leetcode",
        "difficulty": "Medium",
        "url": "https://leetcode.com/problems/lru-cache"
      },
      {
        "title": "LFU cache",
        "source": "leetcode",
        "difficulty": "Hard",
        "url": "https://leetcode.com/problems/lfu-cache"
      }
    ]
  },
  {
    "name": "Array Hashing and Counting",
    "week": 4,
    "problems": [
      {
        "title": "Remove duplicates from Sorted array",
        "source": "leetcode",
        "difficulty": "Easy",
        "url": "https://leetcode.com/problems/remove-duplicates-from-sorted-array"
      },
      {
        "title": "Find the Union",
        "source": "tuf",
        "difficulty": "Medium",
        "url": "https://takeuforward.org/plus/dsa/problems/union-of-two-sorted-arrays"
      },
      {
        "title": "Find missing number in an array",
        "source": "leetcode",
        "difficulty": "Easy",
        "url": "https://leetcode.com/problems/missing-number"
      },
      {
        "title": "Find the number that appears once, and other numbers twice.",
        "source": "leetcode",
        "difficulty": "Easy",
        "url": "https://leetcode.com/problems/single-number"
      },
      {
        "title": "Majority Element (>n/2 times)",
        "source": "leetcode",
        "difficulty": "Easy",
        "url": "https://leetcode.com/problems/majority-element"
      },
      {
        "title": "Majority Element (n/3 times)",
        "source": "leetcode",
        "difficulty": "Medium",
        "url": "https://leetcode.com/problems/majority-element-ii"
      },
      {
        "title": "Find the repeating and missing number",
        "source": "tuf",
        "difficulty": "Easy",
        "url": "https://takeuforward.org/plus/dsa/problems/find-the-repeating-and-missing-number"
      }
    ]
  },
  {
    "name": "Hashing and Frequency Counting",
    "week": 4,
    "problems": [
      {
        "title": "Counting frequencies of array elements",
        "source": "tuf",
        "difficulty": "Easy",
        "url": "https://takeuforward.org/plus/dsa/problems/counting-frequencies-of-array-elements"
      },
      {
        "title": "Find the highest/lowest frequency element",
        "source": "leetcode",
        "difficulty": "Medium",
        "url": "https://leetcode.com/problems/frequency-of-the-most-frequent-element"
      },
      {
        "title": "Hashing Theory",
        "source": "tuf",
        "difficulty": "Medium",
        "url": "https://takeuforward.org/hashing/hashing-maps-time-complexity-collisions-division-rule-of-hashing-strivers-a2z-dsa-course/"
      }
    ]
  },
  {
    "name": "Prefix Sum and Subarray Counting",
    "week": 4,
    "problems": [
      {
        "title": "Longest subarray with given sum K(positives)",
        "source": "tuf",
        "difficulty": "Medium",
        "url": "https://takeuforward.org/plus/dsa/problems/longest-subarray-with-sum-k"
      },
      {
        "title": "Longest subarray with sum K (Positives + Negatives)",
        "source": "tuf",
        "difficulty": "Medium",
        "url": "https://takeuforward.org/plus/dsa/problems/longest-subarray-with-sum-k"
      },
      {
        "title": "Count subarrays with given sum",
        "source": "leetcode",
        "difficulty": "Medium",
        "url": "https://leetcode.com/problems/subarray-sum-equals-k"
      },
      {
        "title": "Largest Subarray with 0 Sum",
        "source": "tuf",
        "difficulty": "Medium",
        "url": "https://takeuforward.org/plus/dsa/problems/largest-subarray-with-sum-0"
      },
      {
        "title": "Count number of subarrays with given xor K",
        "source": "interviewbit",
        "difficulty": "Medium",
        "url": "https://www.interviewbit.com/problems/subarray-with-given-xor"
      },
      {
        "title": "Maximum Product Subarray",
        "source": "leetcode",
        "difficulty": "Medium",
        "url": "https://leetcode.com/problems/maximum-product-subarray"
      }
    ]
  },
  {
    "name": "Sliding Window and Two Pointers",
    "week": 4,
    "problems": [
      {
        "title": "Longest Substring Without Repeating Characters",
        "source": "leetcode",
        "difficulty": "Medium",
        "url": "https://leetcode.com/problems/longest-substring-without-repeating-characters"
      },
      {
        "title": "Max Consecutive Ones III",
        "source": "leetcode",
        "difficulty": "Medium",
        "url": "https://leetcode.com/problems/max-consecutive-ones-iii"
      },
      {
        "title": "Fruit Into Baskets",
        "source": "tuf",
        "difficulty": "Medium",
        "url": "https://takeuforward.org/plus/dsa/problems/fruit-into-baskets"
      },
      {
        "title": "longest repeating character replacement",
        "source": "leetcode",
        "difficulty": "Medium",
        "url": "https://leetcode.com/problems/longest-repeating-character-replacement"
      },
      {
        "title": "Binary subarray with sum",
        "source": "leetcode",
        "difficulty": "Medium",
        "url": "https://leetcode.com/problems/binary-subarrays-with-sum"
      },
      {
        "title": "Count number of nice subarrays",
        "source": "leetcode",
        "difficulty": "Medium",
        "url": "https://leetcode.com/problems/count-number-of-nice-subarrays"
      },
      {
        "title": "Number of substring containing all three characters",
        "source": "leetcode",
        "difficulty": "Medium",
        "url": "https://leetcode.com/problems/number-of-substrings-containing-all-three-characters"
      },
      {
        "title": "Maximum point you can obtain from cards",
        "source": "leetcode",
        "difficulty": "Medium",
        "url": "https://leetcode.com/problems/maximum-points-you-can-obtain-from-cards"
      },
      {
        "title": "Longest Substring with At Most K Distinct Characters",
        "source": "leetcode",
        "difficulty": "Medium",
        "url": "https://leetcode.com/problems/longest-substring-with-at-most-k-distinct-characters"
      },
      {
        "title": "Subarray with k different integers",
        "source": "leetcode",
        "difficulty": "Hard",
        "url": "https://leetcode.com/problems/subarrays-with-k-different-integers"
      },
      {
        "title": "Minimum Window Substring",
        "source": "leetcode",
        "difficulty": "Hard",
        "url": "https://leetcode.com/problems/minimum-window-substring"
      },
      {
        "title": "Minimum Window Subsequence",
        "source": "leetcode",
        "difficulty": "Hard",
        "url": "https://leetcode.com/problems/minimum-window-subsequence"
      }
    ]
  },
  {
    "name": "String Hashing and Counting",
    "week": 4,
    "problems": [
      {
        "title": "Isomorphic String",
        "source": "leetcode",
        "difficulty": "Easy",
        "url": "https://leetcode.com/problems/isomorphic-strings"
      },
      {
        "title": "Check if two strings are anagram of each other",
        "source": "leetcode",
        "difficulty": "Easy",
        "url": "https://leetcode.com/problems/valid-anagram"
      },
      {
        "title": "Sort Characters by frequency",
        "source": "leetcode",
        "difficulty": "Medium",
        "url": "https://leetcode.com/problems/sort-characters-by-frequency"
      },
      {
        "title": "Hashing In Strings | Theory",
        "source": "leetcode",
        "difficulty": "Easy",
        "url": "https://leetcode.com/problems/find-the-index-of-the-first-occurrence-in-a-string"
      }
    ]
  },
  {
    "name": "Bitwise Tries",
    "week": 5,
    "problems": [
      {
        "title": "Maximum XOR of two numbers in an array",
        "source": "leetcode",
        "difficulty": "Medium",
        "url": "https://leetcode.com/problems/maximum-xor-of-two-numbers-in-an-array"
      },
      {
        "title": "Maximum XOR With an Element From Array",
        "source": "leetcode",
        "difficulty": "Hard",
        "url": "https://leetcode.com/problems/maximum-xor-with-an-element-from-array"
      }
    ]
  },
  {
    "name": "Tree Construction, Paths and Serialization",
    "week": 5,
    "problems": [
      {
        "title": "Root to Node Path in Binary Tree",
        "source": "tuf",
        "difficulty": "Medium",
        "url": "https://takeuforward.org/plus/dsa/problems/print-root-to-note-path-in-bt"
      },
      {
        "title": "LCA in Binary Tree",
        "source": "leetcode",
        "difficulty": "Medium",
        "url": "https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-tree"
      },
      {
        "title": "Maximum width of a Binary Tree",
        "source": "leetcode",
        "difficulty": "Medium",
        "url": "https://leetcode.com/problems/maximum-width-of-binary-tree"
      },
      {
        "title": "Check for Children Sum Property",
        "source": "tuf",
        "difficulty": "Medium",
        "url": "https://takeuforward.org/plus/dsa/problems/children-sum-property-in-binary-tree"
      },
      {
        "title": "Print all the Nodes at a distance of K in a Binary Tree",
        "source": "leetcode",
        "difficulty": "Medium",
        "url": "https://leetcode.com/problems/all-nodes-distance-k-in-binary-tree"
      },
      {
        "title": "Minimum time taken to BURN the Binary Tree from a Node",
        "source": "tuf",
        "difficulty": "Hard",
        "url": "https://takeuforward.org/plus/dsa/problems/minimum-time-taken-to-burn-the-bt-from-a-given-node"
      },
      {
        "title": "Count total Nodes in a COMPLETE Binary Tree",
        "source": "leetcode",
        "difficulty": "Easy",
        "url": "https://leetcode.com/problems/count-complete-tree-nodes"
      },
      {
        "title": "Requirements needed to construct a Unique Binary Tree | Theory",
        "source": "tuf",
        "difficulty": "Easy",
        "url": "https://takeuforward.org/plus/dsa/problems/requirements-needed-to-construct-a-unique-bt"
      },
      {
        "title": "Construct Binary Tree from inorder and preorder",
        "source": "leetcode",
        "difficulty": "Medium",
        "url": "https://leetcode.com/problems/construct-binary-tree-from-preorder-and-inorder-traversal"
      },
      {
        "title": "Construct the Binary Tree from Postorder and Inorder Traversal",
        "source": "leetcode",
        "difficulty": "Medium",
        "url": "https://leetcode.com/problems/construct-binary-tree-from-inorder-and-postorder-traversal"
      },
      {
        "title": "Serialize and deserialize Binary Tree",
        "source": "leetcode",
        "difficulty": "Hard",
        "url": "https://leetcode.com/problems/serialize-and-deserialize-binary-tree"
      },
      {
        "title": "Morris Preorder Traversal of a Binary Tree",
        "source": "leetcode",
        "difficulty": "Easy",
        "url": "https://leetcode.com/problems/binary-tree-inorder-traversal"
      },
      {
        "title": "Morris Inorder Traversal of a Binary Tree",
        "source": "leetcode",
        "difficulty": "Easy",
        "url": "https://leetcode.com/problems/binary-tree-inorder-traversal"
      },
      {
        "title": "Flatten Binary Tree to LinkedList",
        "source": "leetcode",
        "difficulty": "Medium",
        "url": "https://leetcode.com/problems/flatten-binary-tree-to-linked-list"
      }
    ]
  },
  {
    "name": "Tree Traversals",
    "week": 5,
    "problems": [
      {
        "title": "Introduction to Trees",
        "source": "tuf",
        "difficulty": "Easy",
        "url": "https://takeuforward.org/binary-tree/introduction-to-trees/"
      },
      {
        "title": "Binary Tree Representation in C++",
        "source": "tuf",
        "difficulty": "Easy",
        "url": "https://takeuforward.org/binary-tree/binary-tree-representation-in-c/"
      },
      {
        "title": "Binary Tree Representation in Java",
        "source": "tuf",
        "difficulty": "Easy",
        "url": "https://takeuforward.org/binary-tree/binary-tree-representation-in-java/"
      },
      {
        "title": "Binary Tree Traversals in Binary Tree",
        "source": "tuf",
        "difficulty": "Easy",
        "url": "https://takeuforward.org/binary-tree/binary-tree-traversal-inorder-preorder-postorder/"
      },
      {
        "title": "Preorder Traversal of Binary Tree",
        "source": "leetcode",
        "difficulty": "Easy",
        "url": "https://leetcode.com/problems/binary-tree-preorder-traversal"
      },
      {
        "title": "Inorder Traversal of Binary Tree",
        "source": "leetcode",
        "difficulty": "Easy",
        "url": "https://leetcode.com/problems/binary-tree-inorder-traversal"
      },
      {
        "title": "Post-order Traversal of Binary Tree",
        "source": "leetcode",
        "difficulty": "Easy",
        "url": "https://leetcode.com/problems/binary-tree-postorder-traversal"
      },
      {
        "title": "Level order Traversal / Level order traversal in spiral form",
        "source": "leetcode",
        "difficulty": "Medium",
        "url": "https://leetcode.com/problems/binary-tree-level-order-traversal"
      },
      {
        "title": "Iterative Preorder Traversal of Binary Tree",
        "source": "leetcode",
        "difficulty": "Easy",
        "url": "https://leetcode.com/problems/binary-tree-preorder-traversal"
      },
      {
        "title": "Iterative Inorder Traversal of Binary Tree",
        "source": "leetcode",
        "difficulty": "Easy",
        "url": "https://leetcode.com/problems/binary-tree-inorder-traversal"
      },
      {
        "title": "Post-order Traversal of Binary Tree using 2 stack",
        "source": "leetcode",
        "difficulty": "Easy",
        "url": "https://leetcode.com/problems/binary-tree-postorder-traversal"
      },
      {
        "title": "Post-order Traversal of Binary Tree using 1 stack",
        "source": "leetcode",
        "difficulty": "Easy",
        "url": "https://leetcode.com/problems/binary-tree-postorder-traversal"
      },
      {
        "title": "Preorder, Inorder, and Postorder Traversal in one Traversal",
        "source": "tuf",
        "difficulty": "Medium",
        "url": "https://takeuforward.org/plus/dsa/problems/pre,-post,-inorder-in-one-traversal"
      }
    ]
  },
  {
    "name": "Tree Views and Properties",
    "week": 5,
    "problems": [
      {
        "title": "Height of a Binary Tree",
        "source": "leetcode",
        "difficulty": "Easy",
        "url": "https://leetcode.com/problems/maximum-depth-of-binary-tree"
      },
      {
        "title": "Check if the Binary tree is height-balanced or not",
        "source": "leetcode",
        "difficulty": "Easy",
        "url": "https://leetcode.com/problems/balanced-binary-tree"
      },
      {
        "title": "Diameter of Binary Tree",
        "source": "leetcode",
        "difficulty": "Easy",
        "url": "https://leetcode.com/problems/diameter-of-binary-tree"
      },
      {
        "title": "Maximum path sum",
        "source": "leetcode",
        "difficulty": "Hard",
        "url": "https://leetcode.com/problems/binary-tree-maximum-path-sum"
      },
      {
        "title": "Check if two trees are identical or not",
        "source": "leetcode",
        "difficulty": "Easy",
        "url": "https://leetcode.com/problems/same-tree"
      },
      {
        "title": "Zig Zag Traversal of Binary Tree",
        "source": "leetcode",
        "difficulty": "Medium",
        "url": "https://leetcode.com/problems/binary-tree-zigzag-level-order-traversal"
      },
      {
        "title": "Boundary Traversal of Binary Tree",
        "source": "leetcode",
        "difficulty": "Medium",
        "url": "https://leetcode.com/problems/boundary-of-binary-tree"
      },
      {
        "title": "Vertical Order Traversal of Binary Tree",
        "source": "leetcode",
        "difficulty": "Hard",
        "url": "https://leetcode.com/problems/vertical-order-traversal-of-a-binary-tree"
      },
      {
        "title": "Top View of Binary Tree",
        "source": "tuf",
        "difficulty": "Medium",
        "url": "https://takeuforward.org/plus/dsa/problems/top-view-of-bt"
      },
      {
        "title": "Bottom View of Binary Tree",
        "source": "tuf",
        "difficulty": "Medium",
        "url": "https://takeuforward.org/plus/dsa/problems/bottom-view-of-bt"
      },
      {
        "title": "Right/Left View of Binary Tree",
        "source": "leetcode",
        "difficulty": "Medium",
        "url": "https://leetcode.com/problems/binary-tree-right-side-view"
      },
      {
        "title": "Symmetric Binary Tree",
        "source": "leetcode",
        "difficulty": "Easy",
        "url": "https://leetcode.com/problems/symmetric-tree"
      }
    ]
  },
  {
    "name": "Trie and Prefix Search",
    "week": 5,
    "problems": [
      {
        "title": "Implement TRIE | INSERT | SEARCH | STARTSWITH",
        "source": "leetcode",
        "difficulty": "Medium",
        "url": "https://leetcode.com/problems/implement-trie-prefix-tree"
      },
      {
        "title": "Implement Trie - 2 (Prefix Tree)",
        "source": "tuf",
        "difficulty": "Medium",
        "url": "https://takeuforward.org/plus/dsa/problems/trie-implementation-and-advanced-operations"
      },
      {
        "title": "Longest String with All Prefixes",
        "source": "tuf",
        "difficulty": "Hard",
        "url": "https://takeuforward.org/plus/dsa/problems/longest-word-with-all-prefixes"
      },
      {
        "title": "Number of Distinct Substrings in a String",
        "source": "tuf",
        "difficulty": "Medium",
        "url": "https://takeuforward.org/plus/dsa/problems/number-of-distinct-substrings-in-a-string"
      },
      {
        "title": "Bit PreRequisites for TRIE Problems",
        "source": "leetcode",
        "difficulty": "Easy",
        "url": "https://leetcode.com/problems/single-number"
      }
    ]
  },
  {
    "name": "Heap Fundamentals",
    "week": 6,
    "problems": [
      {
        "title": "Introduction to Priority Queues using Binary Heaps",
        "source": "tuf",
        "difficulty": "Easy",
        "url": "https://takeuforward.org/data-structure/introduction-to-priority-queues-using-binary-heaps"
      },
      {
        "title": "Min Heap and Max Heap Implementation",
        "source": "tuf",
        "difficulty": "Medium",
        "url": "https://takeuforward.org/plus/dsa/problems/implement-min-heap"
      },
      {
        "title": "Check if an array represents a min-heap or not",
        "source": "tuf",
        "difficulty": "Easy",
        "url": "https://takeuforward.org/plus/dsa/problems/check-if-an-array-represents-a-min-heap-"
      },
      {
        "title": "Convert min Heap to max Heap",
        "source": "tuf",
        "difficulty": "Medium",
        "url": "https://takeuforward.org/plus/dsa/problems/convert-min-heap-to-max-heap"
      }
    ]
  },
  {
    "name": "Heap and Priority Queue Patterns",
    "week": 6,
    "problems": [
      {
        "title": "Kth largest element in an array [use priority queue]",
        "source": "leetcode",
        "difficulty": "Medium",
        "url": "https://leetcode.com/problems/kth-largest-element-in-an-array"
      },
      {
        "title": "Kth smallest element in an array [use priority queue]",
        "source": "tuf",
        "difficulty": "Medium",
        "url": "https://takeuforward.org/data-structure/kth-largest-smallest-element-in-an-array/"
      },
      {
        "title": "Sort K sorted array",
        "source": "leetcode",
        "difficulty": "Hard",
        "url": "https://leetcode.com/problems/merge-k-sorted-lists"
      },
      {
        "title": "Merge M sorted Lists",
        "source": "leetcode",
        "difficulty": "Hard",
        "url": "https://leetcode.com/problems/merge-k-sorted-lists"
      },
      {
        "title": "Replace each array element by its corresponding rank",
        "source": "tuf",
        "difficulty": "Medium",
        "url": "https://takeuforward.org/data-structure/replace-elements-by-its-rank-in-the-array/"
      },
      {
        "title": "Task Scheduler",
        "source": "leetcode",
        "difficulty": "Medium",
        "url": "https://leetcode.com/problems/task-scheduler"
      },
      {
        "title": "Hands of Straights",
        "source": "leetcode",
        "difficulty": "Medium",
        "url": "https://leetcode.com/problems/hand-of-straights"
      },
      {
        "title": "Design twitter",
        "source": "leetcode",
        "difficulty": "Medium",
        "url": "https://leetcode.com/problems/design-twitter"
      },
      {
        "title": "Connect `n` ropes with minimal cost",
        "source": "tuf",
        "difficulty": "Medium",
        "url": "https://takeuforward.org/plus/dsa/problems/minimum-cost-to-connect-sticks"
      },
      {
        "title": "Kth largest element in a stream of running integers",
        "source": "leetcode",
        "difficulty": "Easy",
        "url": "https://leetcode.com/problems/kth-largest-element-in-a-stream"
      },
      {
        "title": "Maximum Sum Combination",
        "source": "interviewbit",
        "difficulty": "Medium",
        "url": "https://www.interviewbit.com/problems/maximum-sum-combinations"
      },
      {
        "title": "Find Median from Data Stream",
        "source": "leetcode",
        "difficulty": "Hard",
        "url": "https://leetcode.com/problems/find-median-from-data-stream"
      },
      {
        "title": "K most frequent elements",
        "source": "leetcode",
        "difficulty": "Medium",
        "url": "https://leetcode.com/problems/top-k-frequent-elements"
      }
    ]
  },
  {
    "name": "Intervals",
    "week": 6,
    "problems": [
      {
        "title": "Merge Overlapping Subintervals",
        "source": "leetcode",
        "difficulty": "Medium",
        "url": "https://leetcode.com/problems/merge-intervals"
      }
    ]
  },
  {
    "name": "Sorting Algorithms",
    "week": 6,
    "problems": [
      {
        "title": "Selection Sort",
        "source": "tuf",
        "difficulty": "Easy",
        "url": "https://takeuforward.org/plus/dsa/problems/selection-sort"
      },
      {
        "title": "Bubble Sort",
        "source": "tuf",
        "difficulty": "Easy",
        "url": "https://takeuforward.org/plus/dsa/problems/bubble-sort"
      },
      {
        "title": "Insertion Sort",
        "source": "tuf",
        "difficulty": "Easy",
        "url": "https://takeuforward.org/plus/dsa/problems/recursive-insertion-sort"
      },
      {
        "title": "Merge Sort",
        "source": "tuf",
        "difficulty": "Medium",
        "url": "https://takeuforward.org/plus/dsa/problems/merge-sorting"
      },
      {
        "title": "Recursive Bubble Sort",
        "source": "tuf",
        "difficulty": "Easy",
        "url": "https://takeuforward.org/plus/dsa/problems/recursive-bubble-sort"
      },
      {
        "title": "Recursive Insertion Sort",
        "source": "tuf",
        "difficulty": "Easy",
        "url": "https://takeuforward.org/plus/dsa/problems/recursive-insertion-sort"
      },
      {
        "title": "Quick Sort",
        "source": "tuf",
        "difficulty": "Medium",
        "url": "https://takeuforward.org/plus/dsa/problems/quick-sorting"
      }
    ]
  },
  {
    "name": "Advanced Graph Algorithms",
    "week": 7,
    "problems": [
      {
        "title": "Bridges in Graph",
        "source": "leetcode",
        "difficulty": "Hard",
        "url": "https://leetcode.com/problems/critical-connections-in-a-network"
      },
      {
        "title": "Articulation Point",
        "source": "tuf",
        "difficulty": "Hard",
        "url": "https://takeuforward.org/plus/dsa/problems/articulation-point-in-graph"
      },
      {
        "title": "Kosaraju's Algorithm",
        "source": "tuf",
        "difficulty": "Medium",
        "url": "https://takeuforward.org/plus/dsa/problems/kosaraju's-algorithm"
      }
    ]
  },
  {
    "name": "Graph BFS and DFS",
    "week": 7,
    "problems": [
      {
        "title": "Number of provinces (leetcode)",
        "source": "leetcode",
        "difficulty": "Medium",
        "url": "https://leetcode.com/problems/number-of-provinces"
      },
      {
        "title": "Connected Components Problem in Matrix",
        "source": "tuf",
        "difficulty": "Medium",
        "url": "https://takeuforward.org/plus/dsa/problems/connected-components"
      },
      {
        "title": "Rotten Oranges",
        "source": "leetcode",
        "difficulty": "Medium",
        "url": "https://leetcode.com/problems/rotting-oranges"
      },
      {
        "title": "Flood fill",
        "source": "leetcode",
        "difficulty": "Easy",
        "url": "https://leetcode.com/problems/flood-fill"
      },
      {
        "title": "Cycle Detection in unirected Graph (bfs)",
        "source": "tuf",
        "difficulty": "Medium",
        "url": "https://takeuforward.org/plus/dsa/problems/detect-a-cycle-in-an-undirected-graph"
      },
      {
        "title": "Cycle Detection in undirected Graph (dfs)",
        "source": "tuf",
        "difficulty": "Medium",
        "url": "https://takeuforward.org/plus/dsa/problems/detect-a-cycle-in-an-undirected-graph"
      },
      {
        "title": "0/1 Matrix (Bfs Problem)",
        "source": "leetcode",
        "difficulty": "Medium",
        "url": "https://leetcode.com/problems/01-matrix"
      },
      {
        "title": "Surrounded Regions (dfs)",
        "source": "leetcode",
        "difficulty": "Medium",
        "url": "https://leetcode.com/problems/surrounded-regions"
      },
      {
        "title": "Number of Enclaves [flood fill implementation - multisource]",
        "source": "leetcode",
        "difficulty": "Medium",
        "url": "https://leetcode.com/problems/number-of-enclaves"
      },
      {
        "title": "Word ladder - 1",
        "source": "leetcode",
        "difficulty": "Hard",
        "url": "https://leetcode.com/problems/word-ladder"
      },
      {
        "title": "Word ladder - 2",
        "source": "leetcode",
        "difficulty": "Hard",
        "url": "https://leetcode.com/problems/word-ladder-ii"
      },
      {
        "title": "Number of Distinct Islands [dfs multisource]",
        "source": "leetcode",
        "difficulty": "Hard",
        "url": "https://leetcode.com/problems/number-of-distinct-islands-ii"
      },
      {
        "title": "Bipartite Graph (DFS)",
        "source": "leetcode",
        "difficulty": "Medium",
        "url": "https://leetcode.com/problems/is-graph-bipartite"
      },
      {
        "title": "Cycle Detection in Directed Graph (DFS)",
        "source": "leetcode",
        "difficulty": "Medium",
        "url": "https://leetcode.com/problems/course-schedule-ii"
      }
    ]
  },
  {
    "name": "Graph Fundamentals",
    "week": 7,
    "problems": [
      {
        "title": "Graph and Types",
        "source": "tuf",
        "difficulty": "Easy",
        "url": "https://takeuforward.org/graph/introduction-to-graph/"
      },
      {
        "title": "Graph Representation | C++",
        "source": "tuf",
        "difficulty": "Easy",
        "url": "https://takeuforward.org/graph/graph-representation-in-c/"
      },
      {
        "title": "Graph Representation | Java",
        "source": "hackerrank",
        "difficulty": "Easy",
        "url": "https://www.hackerrank.com/contests/vit-bhopal/challenges/adjacency-list-representation-1/problem"
      },
      {
        "title": "Connected Components | Logic Explanation",
        "source": "leetcode",
        "difficulty": "Medium",
        "url": "https://leetcode.com/problems/number-of-connected-components-in-an-undirected-graph"
      },
      {
        "title": "BFS",
        "source": "tuf",
        "difficulty": "Easy",
        "url": "https://takeuforward.org/plus/dsa/problems/traversal-techniques"
      },
      {
        "title": "DFS",
        "source": "tuf",
        "difficulty": "Easy",
        "url": "https://takeuforward.org/plus/dsa/problems/traversal-techniques"
      }
    ]
  },
  {
    "name": "Minimum Spanning Tree and Union Find",
    "week": 7,
    "problems": [
      {
        "title": "Minimum Spanning Tree",
        "source": "tuf",
        "difficulty": "Medium",
        "url": "https://takeuforward.org/plus/dsa/problems/find-the-mst-weight"
      },
      {
        "title": "Prim's Algorithm",
        "source": "tuf",
        "difficulty": "Medium",
        "url": "https://takeuforward.org/plus/dsa/problems/find-the-mst-weight"
      },
      {
        "title": "Disjoint Set [Union by Rank]",
        "source": "tuf",
        "difficulty": "Easy",
        "url": "https://takeuforward.org/plus/dsa/problems/disjoint-set-"
      },
      {
        "title": "Disjoint Set [Union by Size]",
        "source": "tuf",
        "difficulty": "Easy",
        "url": "https://takeuforward.org/plus/dsa/problems/disjoint-set-"
      },
      {
        "title": "Kruskal's Algorithm",
        "source": "tuf",
        "difficulty": "Medium",
        "url": "https://takeuforward.org/plus/dsa/problems/find-the-mst-weight"
      },
      {
        "title": "Number of operations to make network connected",
        "source": "leetcode",
        "difficulty": "Medium",
        "url": "https://leetcode.com/problems/number-of-operations-to-make-network-connected"
      },
      {
        "title": "Most stones removed with same rows or columns",
        "source": "leetcode",
        "difficulty": "Medium",
        "url": "https://leetcode.com/problems/most-stones-removed-with-same-row-or-column"
      },
      {
        "title": "Accounts merge",
        "source": "leetcode",
        "difficulty": "Medium",
        "url": "https://leetcode.com/problems/accounts-merge"
      },
      {
        "title": "Number of island II",
        "source": "leetcode",
        "difficulty": "Hard",
        "url": "https://leetcode.com/problems/number-of-islands-ii"
      },
      {
        "title": "Making a Large Island",
        "source": "leetcode",
        "difficulty": "Hard",
        "url": "https://leetcode.com/problems/making-a-large-island"
      },
      {
        "title": "Swim in rising water",
        "source": "leetcode",
        "difficulty": "Hard",
        "url": "https://leetcode.com/problems/swim-in-rising-water"
      }
    ]
  },
  {
    "name": "Shortest Path Algorithms",
    "week": 7,
    "problems": [
      {
        "title": "Shortest Path in UG with unit weights",
        "source": "tuf",
        "difficulty": "Medium",
        "url": "https://takeuforward.org/plus/dsa/problems/shortest-path-in-undirected-graph-with-unit-weights"
      },
      {
        "title": "Shortest Path in DAG",
        "source": "tuf",
        "difficulty": "Medium",
        "url": "https://takeuforward.org/plus/dsa/problems/shortest-path-in-dag"
      },
      {
        "title": "Djisktra's Algorithm",
        "source": "tuf",
        "difficulty": "Medium",
        "url": "https://takeuforward.org/plus/dsa/problems/dijkstra's-algorithm"
      },
      {
        "title": "Why priority Queue is used in Djisktra's Algorithm",
        "source": "tuf",
        "difficulty": "Medium",
        "url": "https://takeuforward.org/plus/dsa/problems/dijkstra's-algorithm"
      },
      {
        "title": "Shortest path in a binary maze",
        "source": "leetcode",
        "difficulty": "Medium",
        "url": "https://leetcode.com/problems/shortest-path-in-binary-matrix"
      },
      {
        "title": "Path with minimum effort",
        "source": "leetcode",
        "difficulty": "Medium",
        "url": "https://leetcode.com/problems/path-with-minimum-effort"
      },
      {
        "title": "Cheapest flights within k stops",
        "source": "leetcode",
        "difficulty": "Medium",
        "url": "https://leetcode.com/problems/cheapest-flights-within-k-stops"
      },
      {
        "title": "Network Delay time",
        "source": "leetcode",
        "difficulty": "Medium",
        "url": "https://leetcode.com/problems/network-delay-time"
      },
      {
        "title": "Number of ways to arrive at destination",
        "source": "leetcode",
        "difficulty": "Medium",
        "url": "https://leetcode.com/problems/number-of-ways-to-arrive-at-destination"
      },
      {
        "title": "Minimum steps to reach end from start by performing multiplication and mod operations with array elements",
        "source": "tuf",
        "difficulty": "Medium",
        "url": "https://takeuforward.org/plus/dsa/problems/minimum-multiplications-to-reach-end"
      },
      {
        "title": "Bellman Ford Algorithm",
        "source": "tuf",
        "difficulty": "Medium",
        "url": "https://takeuforward.org/plus/dsa/problems/bellman-ford-algorithm"
      },
      {
        "title": "Floyd Warshal Algorithm",
        "source": "tuf",
        "difficulty": "Medium",
        "url": "https://takeuforward.org/plus/dsa/problems/floyd-warshall-algorithm"
      },
      {
        "title": "Find the city with the smallest number of neighbors in a threshold distance",
        "source": "leetcode",
        "difficulty": "Medium",
        "url": "https://leetcode.com/problems/find-the-city-with-the-smallest-number-of-neighbors-at-a-threshold-distance"
      }
    ]
  },
  {
    "name": "Topological Sort and DAGs",
    "week": 7,
    "problems": [
      {
        "title": "Topo Sort",
        "source": "tuf",
        "difficulty": "Medium",
        "url": "https://takeuforward.org/plus/dsa/problems/topological-sort-or-kahns-algorithm"
      },
      {
        "title": "Kahn's Algorithm",
        "source": "tuf",
        "difficulty": "Medium",
        "url": "https://takeuforward.org/plus/dsa/problems/topological-sort-or-kahns-algorithm"
      },
      {
        "title": "Cycle Detection in Directed Graph (BFS)",
        "source": "tuf",
        "difficulty": "Medium",
        "url": "https://takeuforward.org/plus/dsa/problems/detect-a-cycle-in-a-directed-graph"
      },
      {
        "title": "Course Schedule - I",
        "source": "leetcode",
        "difficulty": "Medium",
        "url": "https://leetcode.com/problems/course-schedule"
      },
      {
        "title": "Course Schedule - II",
        "source": "leetcode",
        "difficulty": "Medium",
        "url": "https://leetcode.com/problems/course-schedule-ii"
      },
      {
        "title": "Find eventual safe states",
        "source": "leetcode",
        "difficulty": "Medium",
        "url": "https://leetcode.com/problems/find-eventual-safe-states"
      },
      {
        "title": "Alien dictionary",
        "source": "leetcode",
        "difficulty": "Hard",
        "url": "https://leetcode.com/problems/alien-dictionary"
      }
    ]
  },
  {
    "name": "Backtracking and Constraint Search",
    "week": 8,
    "problems": [
      {
        "title": "Palindrome Partitioning",
        "source": "leetcode",
        "difficulty": "Medium",
        "url": "https://leetcode.com/problems/palindrome-partitioning"
      },
      {
        "title": "Word Search",
        "source": "leetcode",
        "difficulty": "Medium",
        "url": "https://leetcode.com/problems/word-search"
      },
      {
        "title": "N Queen",
        "source": "leetcode",
        "difficulty": "Hard",
        "url": "https://leetcode.com/problems/n-queens"
      },
      {
        "title": "Rat in a Maze",
        "source": "tuf",
        "difficulty": "Medium",
        "url": "https://takeuforward.org/plus/dsa/problems/rat-in-a-maze"
      },
      {
        "title": "Word Break",
        "source": "leetcode",
        "difficulty": "Medium",
        "url": "https://leetcode.com/problems/word-break"
      },
      {
        "title": "M Coloring Problem",
        "source": "tuf",
        "difficulty": "Medium",
        "url": "https://takeuforward.org/plus/dsa/problems/m-coloring-problem"
      },
      {
        "title": "Sudoko Solver",
        "source": "leetcode",
        "difficulty": "Hard",
        "url": "https://leetcode.com/problems/sudoku-solver"
      },
      {
        "title": "Expression Add Operators",
        "source": "leetcode",
        "difficulty": "Hard",
        "url": "https://leetcode.com/problems/expression-add-operators"
      }
    ]
  },
  {
    "name": "Recursion Fundamentals",
    "week": 8,
    "problems": [
      {
        "title": "Understand recursion by print something N times",
        "source": "tuf",
        "difficulty": "Basic",
        "url": "https://takeuforward.org/plus/dsa/problems/print-1-to-n-using-recursion"
      },
      {
        "title": "Print name N times using recursion",
        "source": "tuf",
        "difficulty": "Easy",
        "url": "https://takeuforward.org/recursion/print-name-n-times-using-recursion/"
      },
      {
        "title": "Print 1 to N using recursion",
        "source": "tuf",
        "difficulty": "Basic",
        "url": "https://takeuforward.org/recursion/introduction-to-recursion-understand-recursion-by-printing-something-n-times/"
      },
      {
        "title": "Print N to 1 using recursion",
        "source": "tuf",
        "difficulty": "Easy",
        "url": "https://takeuforward.org/plus/dsa/problems/print-n-to-1-using-recursion"
      },
      {
        "title": "Sum of first N numbers",
        "source": "tuf",
        "difficulty": "Basic",
        "url": "https://takeuforward.org/plus/dsa/problems/sum-of-first-n-numbers"
      },
      {
        "title": "Factorial of N numbers",
        "source": "tuf",
        "difficulty": "Easy",
        "url": "https://takeuforward.org/plus/dsa/problems/factorial-of-a-given-number"
      },
      {
        "title": "Reverse an array",
        "source": "leetcode",
        "difficulty": "Easy",
        "url": "https://leetcode.com/problems/reverse-string"
      },
      {
        "title": "Check if a string is palindrome or not",
        "source": "leetcode",
        "difficulty": "Easy",
        "url": "https://leetcode.com/problems/valid-palindrome"
      },
      {
        "title": "Fibonacci Number",
        "source": "leetcode",
        "difficulty": "Easy",
        "url": "https://leetcode.com/problems/fibonacci-number"
      }
    ]
  },
  {
    "name": "Recursive Problem Solving",
    "week": 8,
    "problems": [
      {
        "title": "Recursive Implementation of atoi()",
        "source": "leetcode",
        "difficulty": "Medium",
        "url": "https://leetcode.com/problems/string-to-integer-atoi"
      },
      {
        "title": "Pow(x, n)",
        "source": "leetcode",
        "difficulty": "Medium",
        "url": "https://leetcode.com/problems/powx-n"
      },
      {
        "title": "Count Good numbers",
        "source": "leetcode",
        "difficulty": "Medium",
        "url": "https://leetcode.com/problems/count-good-numbers"
      },
      {
        "title": "Sort a stack using recursion",
        "source": "tuf",
        "difficulty": "Medium",
        "url": "https://takeuforward.org/plus/dsa/problems/sort-a-stack"
      },
      {
        "title": "Reverse a stack using recursion",
        "source": "tuf",
        "difficulty": "Medium",
        "url": "https://takeuforward.org/plus/dsa/problems/reverse-a-stack"
      }
    ]
  },
  {
    "name": "Subsets and Subsequences",
    "week": 8,
    "problems": [
      {
        "title": "Generate all binary strings",
        "source": "tuf",
        "difficulty": "Easy",
        "url": "https://takeuforward.org/plus/dsa/problems/generate-binary-strings-without-consecutive-1s"
      },
      {
        "title": "Generate Paranthesis",
        "source": "leetcode",
        "difficulty": "Medium",
        "url": "https://leetcode.com/problems/generate-parentheses"
      },
      {
        "title": "Print all subsequences/Power Set",
        "source": "leetcode",
        "difficulty": "Medium",
        "url": "https://leetcode.com/problems/subsets"
      },
      {
        "title": "Learn All Patterns of Subsequences (Theory)",
        "source": "leetcode",
        "difficulty": "Hard",
        "url": "https://leetcode.com/problems/distinct-subsequences-ii"
      },
      {
        "title": "Count all subsequences with sum K",
        "source": "tuf",
        "difficulty": "Medium",
        "url": "https://takeuforward.org/plus/dsa/problems/count-all-subsequences-with-sum-k"
      },
      {
        "title": "Check if there exists a subsequence with sum K",
        "source": "tuf",
        "difficulty": "Medium",
        "url": "https://takeuforward.org/plus/dsa/problems/check-if-there-exists-a-subsequence-with-sum-k"
      },
      {
        "title": "Combination Sum",
        "source": "leetcode",
        "difficulty": "Medium",
        "url": "https://leetcode.com/problems/combination-sum"
      },
      {
        "title": "Combination Sum-II",
        "source": "leetcode",
        "difficulty": "Medium",
        "url": "https://leetcode.com/problems/combination-sum-ii"
      },
      {
        "title": "Subset Sum-I",
        "source": "tuf",
        "difficulty": "Medium",
        "url": "https://takeuforward.org/plus/dsa/problems/subsets-i"
      },
      {
        "title": "Subset Sum-II",
        "source": "leetcode",
        "difficulty": "Medium",
        "url": "https://leetcode.com/problems/subsets-ii"
      },
      {
        "title": "Combination Sum - III",
        "source": "leetcode",
        "difficulty": "Medium",
        "url": "https://leetcode.com/problems/combination-sum-iii"
      },
      {
        "title": "Letter Combinations of a Phone number",
        "source": "leetcode",
        "difficulty": "Medium",
        "url": "https://leetcode.com/problems/letter-combinations-of-a-phone-number"
      }
    ]
  },
  {
    "name": "Binary Search on Answer",
    "week": 9,
    "problems": [
      {
        "title": "Find square root of a number in log n",
        "source": "tuf",
        "difficulty": "Easy",
        "url": "https://takeuforward.org/plus/dsa/problems/find-square-root-of-a-number"
      },
      {
        "title": "Find the Nth root of a number using binary search",
        "source": "tuf",
        "difficulty": "Medium",
        "url": "https://takeuforward.org/plus/dsa/problems/find-nth-root-of-a-number"
      },
      {
        "title": "Koko Eating Bananas",
        "source": "leetcode",
        "difficulty": "Medium",
        "url": "https://leetcode.com/problems/koko-eating-bananas"
      },
      {
        "title": "Minimum days to make M bouquets",
        "source": "leetcode",
        "difficulty": "Medium",
        "url": "https://leetcode.com/problems/minimum-number-of-days-to-make-m-bouquets"
      },
      {
        "title": "Find the smallest Divisor",
        "source": "leetcode",
        "difficulty": "Medium",
        "url": "https://leetcode.com/problems/find-the-smallest-divisor-given-a-threshold"
      },
      {
        "title": "Capacity to Ship Packages within D Days",
        "source": "leetcode",
        "difficulty": "Medium",
        "url": "https://leetcode.com/problems/capacity-to-ship-packages-within-d-days"
      },
      {
        "title": "Kth Missing Positive Number",
        "source": "leetcode",
        "difficulty": "Easy",
        "url": "https://leetcode.com/problems/kth-missing-positive-number"
      },
      {
        "title": "Aggressive Cows",
        "source": "spoj",
        "difficulty": "Easy",
        "url": "https://www.spoj.com/problems/AGGRCOW/"
      },
      {
        "title": "Book Allocation Problem",
        "source": "tuf",
        "difficulty": "Medium",
        "url": "https://takeuforward.org/plus/dsa/problems/book-allocation-problem"
      },
      {
        "title": "Split array - Largest Sum",
        "source": "leetcode",
        "difficulty": "Hard",
        "url": "https://leetcode.com/problems/split-array-largest-sum"
      },
      {
        "title": "Painter's partition",
        "source": "tuf",
        "difficulty": "Medium",
        "url": "https://takeuforward.org/plus/dsa/problems/painters-partition"
      },
      {
        "title": "Minimize Max Distance to Gas Station",
        "source": "leetcode",
        "difficulty": "Hard",
        "url": "https://leetcode.com/problems/minimize-max-distance-to-gas-station"
      },
      {
        "title": "Median of 2 sorted arrays",
        "source": "leetcode",
        "difficulty": "Hard",
        "url": "https://leetcode.com/problems/median-of-two-sorted-arrays"
      },
      {
        "title": "Kth element of 2 sorted arrays",
        "source": "tuf",
        "difficulty": "Medium",
        "url": "https://takeuforward.org/plus/dsa/problems/kth-element-of-2-sorted-arrays"
      }
    ]
  },
  {
    "name": "Binary Search on Matrices",
    "week": 9,
    "problems": [
      {
        "title": "Find the row with maximum number of 1's",
        "source": "tuf",
        "difficulty": "Medium",
        "url": "https://takeuforward.org/plus/dsa/problems/find-row-with-maximum-1's"
      },
      {
        "title": "Search in a 2 D matrix",
        "source": "leetcode",
        "difficulty": "Medium",
        "url": "https://leetcode.com/problems/search-a-2d-matrix"
      },
      {
        "title": "Search in a row and column wise sorted matrix",
        "source": "leetcode",
        "difficulty": "Medium",
        "url": "https://leetcode.com/problems/search-a-2d-matrix-ii"
      },
      {
        "title": "Find Peak Element (2D Matrix)",
        "source": "leetcode",
        "difficulty": "Medium",
        "url": "https://leetcode.com/problems/find-a-peak-element-ii"
      },
      {
        "title": "Matrix Median",
        "source": "tuf",
        "difficulty": "Hard",
        "url": "https://takeuforward.org/plus/dsa/problems/matrix-median"
      }
    ]
  },
  {
    "name": "Binary Search on Sorted Data",
    "week": 9,
    "problems": [
      {
        "title": "Introduction to Binary Search Tree",
        "source": "tuf",
        "difficulty": "Easy",
        "url": "https://takeuforward.org/binary-search-tree/introduction-to-binary-search-trees/"
      },
      {
        "title": "Search in a Binary Search Tree",
        "source": "leetcode",
        "difficulty": "Easy",
        "url": "https://leetcode.com/problems/search-in-a-binary-search-tree"
      },
      {
        "title": "Find Min/Max in BST",
        "source": "hackerrank",
        "difficulty": "Basic",
        "url": "https://www.hackerrank.com/contests/17cs1102/challenges/9a-implement-binary-search-tree"
      },
      {
        "title": "Ceil in a Binary Search Tree",
        "source": "tuf",
        "difficulty": "Medium",
        "url": "https://takeuforward.org/plus/dsa/problems/floor-and-ceil-in-a-bst"
      },
      {
        "title": "Floor in a Binary Search Tree",
        "source": "tuf",
        "difficulty": "Medium",
        "url": "https://takeuforward.org/plus/dsa/problems/floor-and-ceil-in-a-bst"
      },
      {
        "title": "Insert a given Node in Binary Search Tree",
        "source": "leetcode",
        "difficulty": "Medium",
        "url": "https://leetcode.com/problems/insert-into-a-binary-search-tree"
      },
      {
        "title": "Delete a Node in Binary Search Tree",
        "source": "leetcode",
        "difficulty": "Medium",
        "url": "https://leetcode.com/problems/delete-node-in-a-bst"
      },
      {
        "title": "Find K-th smallest/largest element in BST",
        "source": "leetcode",
        "difficulty": "Medium",
        "url": "https://leetcode.com/problems/kth-smallest-element-in-a-bst"
      },
      {
        "title": "Check if a tree is a BST or BT",
        "source": "leetcode",
        "difficulty": "Medium",
        "url": "https://leetcode.com/problems/validate-binary-search-tree"
      },
      {
        "title": "LCA in Binary Search Tree",
        "source": "leetcode",
        "difficulty": "Medium",
        "url": "https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-search-tree"
      },
      {
        "title": "Construct a BST from a preorder traversal",
        "source": "leetcode",
        "difficulty": "Medium",
        "url": "https://leetcode.com/problems/construct-binary-search-tree-from-preorder-traversal"
      },
      {
        "title": "Inorder Successor/Predecessor in BST",
        "source": "leetcode",
        "difficulty": "Medium",
        "url": "https://leetcode.com/problems/inorder-successor-in-bst"
      },
      {
        "title": "Merge 2 BST's",
        "source": "leetcode",
        "difficulty": "Medium",
        "url": "https://leetcode.com/problems/binary-search-tree-iterator"
      },
      {
        "title": "Two Sum In BST | Check if there exists a pair with Sum K",
        "source": "leetcode",
        "difficulty": "Easy",
        "url": "https://leetcode.com/problems/two-sum-iv-input-is-a-bst"
      },
      {
        "title": "Recover BST | Correct BST with two nodes swapped",
        "source": "leetcode",
        "difficulty": "Medium",
        "url": "https://leetcode.com/problems/recover-binary-search-tree"
      },
      {
        "title": "Largest BST in Binary Tree",
        "source": "tuf",
        "difficulty": "Medium",
        "url": "https://takeuforward.org/plus/dsa/problems/largest-bst-in-binary-tree"
      },
      {
        "title": "Binary Search to find X in sorted array",
        "source": "leetcode",
        "difficulty": "Easy",
        "url": "https://leetcode.com/problems/binary-search"
      },
      {
        "title": "Implement Lower Bound",
        "source": "tuf",
        "difficulty": "Easy",
        "url": "https://takeuforward.org/plus/dsa/problems/lower-bound-"
      },
      {
        "title": "Implement Upper Bound",
        "source": "tuf",
        "difficulty": "Easy",
        "url": "https://takeuforward.org/plus/dsa/problems/upper-bound"
      },
      {
        "title": "Search Insert Position",
        "source": "leetcode",
        "difficulty": "Easy",
        "url": "https://leetcode.com/problems/search-insert-position"
      },
      {
        "title": "Floor/Ceil in Sorted Array",
        "source": "tuf",
        "difficulty": "Medium",
        "url": "https://takeuforward.org/plus/dsa/problems/floor-and-ceil-in-sorted-array"
      },
      {
        "title": "Find the first or last occurrence of a given number in a sorted array",
        "source": "leetcode",
        "difficulty": "Medium",
        "url": "https://leetcode.com/problems/find-first-and-last-position-of-element-in-sorted-array"
      },
      {
        "title": "Count occurrences of a number in a sorted array with duplicates",
        "source": "tuf",
        "difficulty": "Easy",
        "url": "https://takeuforward.org/plus/dsa/problems/count-occurrences-in-a-sorted-array"
      },
      {
        "title": "Search in Rotated Sorted Array I",
        "source": "leetcode",
        "difficulty": "Medium",
        "url": "https://leetcode.com/problems/search-in-rotated-sorted-array"
      },
      {
        "title": "Search in Rotated Sorted Array II",
        "source": "leetcode",
        "difficulty": "Medium",
        "url": "https://leetcode.com/problems/search-in-rotated-sorted-array-ii"
      },
      {
        "title": "Find minimum in Rotated Sorted Array",
        "source": "leetcode",
        "difficulty": "Medium",
        "url": "https://leetcode.com/problems/find-minimum-in-rotated-sorted-array"
      },
      {
        "title": "Find out how many times has an array been rotated",
        "source": "tuf",
        "difficulty": "Easy",
        "url": "https://takeuforward.org/plus/dsa/problems/find-out-how-many-times-the-array-is-rotated"
      },
      {
        "title": "Single element in a Sorted Array",
        "source": "leetcode",
        "difficulty": "Medium",
        "url": "https://leetcode.com/problems/single-element-in-a-sorted-array"
      },
      {
        "title": "Find peak element",
        "source": "leetcode",
        "difficulty": "Medium",
        "url": "https://leetcode.com/problems/find-peak-element"
      }
    ]
  },
  {
    "name": "DP on Rectangles and Squares",
    "week": 10,
    "problems": [
      {
        "title": "Maximum Rectangle Area with all 1's|(DP-55)",
        "source": "leetcode",
        "difficulty": "Hard",
        "url": "https://leetcode.com/problems/maximal-rectangle"
      },
      {
        "title": "Count Square Submatrices with All Ones|(DP-56)",
        "source": "leetcode",
        "difficulty": "Medium",
        "url": "https://leetcode.com/problems/count-square-submatrices-with-all-ones"
      }
    ]
  },
  {
    "name": "Dynamic Programming Fundamentals",
    "week": 10,
    "problems": [
      {
        "title": "Dynamic Programming Introduction",
        "source": "tuf",
        "difficulty": "Medium",
        "url": "https://takeuforward.org/plus/dsa/problems/introduction-to-dp"
      }
    ]
  },
  {
    "name": "Grid and Multi-Dimensional DP",
    "week": 10,
    "problems": [
      {
        "title": "Ninja's Training (DP 7)",
        "source": "tuf",
        "difficulty": "Medium",
        "url": "https://takeuforward.org/plus/dsa/problems/ninja's-training"
      },
      {
        "title": "Grid Unique Paths : DP on Grids (DP8)",
        "source": "leetcode",
        "difficulty": "Medium",
        "url": "https://leetcode.com/problems/unique-paths"
      },
      {
        "title": "Grid Unique Paths 2 (DP 9)",
        "source": "leetcode",
        "difficulty": "Medium",
        "url": "https://leetcode.com/problems/unique-paths-ii"
      },
      {
        "title": "Minimum path sum in Grid (DP 10)",
        "source": "leetcode",
        "difficulty": "Medium",
        "url": "https://leetcode.com/problems/minimum-path-sum"
      },
      {
        "title": "Minimum path sum in Triangular Grid (DP 11)",
        "source": "leetcode",
        "difficulty": "Medium",
        "url": "https://leetcode.com/problems/triangle"
      },
      {
        "title": "Minimum/Maximum Falling Path Sum (DP-12)",
        "source": "leetcode",
        "difficulty": "Medium",
        "url": "https://leetcode.com/problems/minimum-falling-path-sum"
      },
      {
        "title": "3-d DP : Ninja and his friends (DP-13)",
        "source": "tuf",
        "difficulty": "Hard",
        "url": "https://takeuforward.org/plus/dsa/problems/ninja-and-his-friends"
      }
    ]
  },
  {
    "name": "Knapsack and Subsequence DP",
    "week": 10,
    "problems": [
      {
        "title": "Subset sum equal to target (DP- 14)",
        "source": "tuf",
        "difficulty": "Medium",
        "url": "https://takeuforward.org/plus/dsa/problems/check-if-there-exists-a-subsequence-with-sum-k"
      },
      {
        "title": "Partition Equal Subset Sum (DP- 15)",
        "source": "leetcode",
        "difficulty": "Medium",
        "url": "https://leetcode.com/problems/partition-equal-subset-sum"
      },
      {
        "title": "Partition Set Into 2 Subsets With Min Absolute Sum Diff (DP- 16)",
        "source": "leetcode",
        "difficulty": "Hard",
        "url": "https://leetcode.com/problems/partition-array-into-two-arrays-to-minimize-sum-difference"
      },
      {
        "title": "Count Subsets with Sum K (DP - 17)",
        "source": "tuf",
        "difficulty": "Medium",
        "url": "https://takeuforward.org/plus/dsa/problems/count-all-subsequences-with-sum-k"
      },
      {
        "title": "Count Partitions with Given Difference (DP - 18)",
        "source": "tuf",
        "difficulty": "Medium",
        "url": "https://takeuforward.org/plus/dsa/problems/count-partitions-with-given-difference"
      },
      {
        "title": "Assign Cookies",
        "source": "leetcode",
        "difficulty": "Easy",
        "url": "https://leetcode.com/problems/assign-cookies"
      },
      {
        "title": "Minimum Coins (DP - 20)",
        "source": "leetcode",
        "difficulty": "Medium",
        "url": "https://leetcode.com/problems/coin-change"
      },
      {
        "title": "Target Sum (DP - 21)",
        "source": "leetcode",
        "difficulty": "Medium",
        "url": "https://leetcode.com/problems/target-sum"
      },
      {
        "title": "Coin Change 2 (DP - 22)",
        "source": "leetcode",
        "difficulty": "Medium",
        "url": "https://leetcode.com/problems/coin-change-ii"
      },
      {
        "title": "Unbounded Knapsack (DP - 23)",
        "source": "tuf",
        "difficulty": "Medium",
        "url": "https://takeuforward.org/plus/dsa/problems/unbounded-knapsack"
      },
      {
        "title": "Rod Cutting Problem | (DP - 24)",
        "source": "tuf",
        "difficulty": "Medium",
        "url": "https://takeuforward.org/plus/dsa/problems/minimum-cost-to-connect-sticks"
      }
    ]
  },
  {
    "name": "Longest Increasing Subsequence",
    "week": 10,
    "problems": [
      {
        "title": "Longest Increasing Subsequence |(DP-41)",
        "source": "leetcode",
        "difficulty": "Medium",
        "url": "https://leetcode.com/problems/longest-increasing-subsequence"
      },
      {
        "title": "Printing Longest Increasing Subsequence|(DP-42)",
        "source": "tuf",
        "difficulty": "Medium",
        "url": "https://takeuforward.org/plus/dsa/problems/print-longest-increasing-subsequence"
      },
      {
        "title": "Longest Increasing Subsequence |(DP-43)",
        "source": "tuf",
        "difficulty": "Medium",
        "url": "https://takeuforward.org/plus/dsa/problems/longest-increasing-subsequence"
      },
      {
        "title": "Largest Divisible Subset|(DP-44)",
        "source": "leetcode",
        "difficulty": "Medium",
        "url": "https://leetcode.com/problems/largest-divisible-subset"
      },
      {
        "title": "Longest String Chain|(DP-45)",
        "source": "leetcode",
        "difficulty": "Medium",
        "url": "https://leetcode.com/problems/longest-string-chain"
      },
      {
        "title": "Longest Bitonic Subsequence |(DP-46)",
        "source": "tuf",
        "difficulty": "Medium",
        "url": "https://takeuforward.org/plus/dsa/problems/longest-bitonic-subsequence"
      },
      {
        "title": "Number of Longest Increasing Subsequences|(DP-47)",
        "source": "leetcode",
        "difficulty": "Medium",
        "url": "https://leetcode.com/problems/number-of-longest-increasing-subsequence"
      }
    ]
  },
  {
    "name": "One-Dimensional DP",
    "week": 10,
    "problems": [
      {
        "title": "Climbing Stars",
        "source": "leetcode",
        "difficulty": "Easy",
        "url": "https://leetcode.com/problems/climbing-stairs"
      },
      {
        "title": "Frog Jump(DP-3)",
        "source": "tuf",
        "difficulty": "Medium",
        "url": "https://takeuforward.org/plus/dsa/problems/frog-jump"
      },
      {
        "title": "Frog Jump with k distances(DP-4)",
        "source": "tuf",
        "difficulty": "Medium",
        "url": "https://takeuforward.org/plus/dsa/problems/frog-jump-with-k-distances"
      },
      {
        "title": "Maximum sum of non-adjacent elements (DP 5)",
        "source": "leetcode",
        "difficulty": "Medium",
        "url": "https://leetcode.com/problems/house-robber"
      },
      {
        "title": "House Robber (DP 6)",
        "source": "leetcode",
        "difficulty": "Medium",
        "url": "https://leetcode.com/problems/house-robber-ii"
      }
    ]
  },
  {
    "name": "Partition DP",
    "week": 10,
    "problems": [
      {
        "title": "Matrix Chain Multiplication|(DP-48)",
        "source": "tuf",
        "difficulty": "Hard",
        "url": "https://takeuforward.org/plus/dsa/problems/matrix-chain-multiplication"
      },
      {
        "title": "Matrix Chain Multiplication | Bottom-Up|(DP-49)",
        "source": "tuf",
        "difficulty": "Hard",
        "url": "https://takeuforward.org/plus/dsa/problems/matrix-chain-multiplication"
      },
      {
        "title": "Minimum Cost to Cut the Stick|(DP-50)",
        "source": "leetcode",
        "difficulty": "Hard",
        "url": "https://leetcode.com/problems/minimum-cost-to-cut-a-stick"
      },
      {
        "title": "Burst Balloons|(DP-51)",
        "source": "leetcode",
        "difficulty": "Hard",
        "url": "https://leetcode.com/problems/burst-balloons"
      },
      {
        "title": "Evaluate Boolean Expression to True|(DP-52)",
        "source": "leetcode",
        "difficulty": "Hard",
        "url": "https://leetcode.com/problems/parsing-a-boolean-expression"
      },
      {
        "title": "Palindrome Partitioning - II|(DP-53)",
        "source": "leetcode",
        "difficulty": "Hard",
        "url": "https://leetcode.com/problems/palindrome-partitioning-ii"
      },
      {
        "title": "Partition Array for Maximum Sum|(DP-54)",
        "source": "leetcode",
        "difficulty": "Medium",
        "url": "https://leetcode.com/problems/partition-array-for-maximum-sum"
      }
    ]
  },
  {
    "name": "State Machine DP",
    "week": 10,
    "problems": [
      {
        "title": "Best Time to Buy and Sell Stock |(DP-35)",
        "source": "leetcode",
        "difficulty": "Easy",
        "url": "https://leetcode.com/problems/best-time-to-buy-and-sell-stock"
      },
      {
        "title": "Buy and Sell Stock - II|(DP-36)",
        "source": "leetcode",
        "difficulty": "Medium",
        "url": "https://leetcode.com/problems/best-time-to-buy-and-sell-stock-ii"
      },
      {
        "title": "Buy and Sell Stocks III|(DP-37)",
        "source": "leetcode",
        "difficulty": "Hard",
        "url": "https://leetcode.com/problems/best-time-to-buy-and-sell-stock-iii"
      },
      {
        "title": "Buy and Stock Sell IV |(DP-38)",
        "source": "leetcode",
        "difficulty": "Hard",
        "url": "https://leetcode.com/problems/best-time-to-buy-and-sell-stock-iv"
      },
      {
        "title": "Buy and Sell Stocks With Cooldown|(DP-39)",
        "source": "leetcode",
        "difficulty": "Medium",
        "url": "https://leetcode.com/problems/best-time-to-buy-and-sell-stock-with-cooldown"
      },
      {
        "title": "Buy and Sell Stocks With Transaction Fee|(DP-40)",
        "source": "leetcode",
        "difficulty": "Medium",
        "url": "https://leetcode.com/problems/best-time-to-buy-and-sell-stock-with-transaction-fee"
      }
    ]
  },
  {
    "name": "String DP",
    "week": 10,
    "problems": [
      {
        "title": "Longest Common Subsequence | (DP - 25)",
        "source": "leetcode",
        "difficulty": "Medium",
        "url": "https://leetcode.com/problems/longest-common-subsequence"
      },
      {
        "title": "Print Longest Common Subsequence | (DP - 26)",
        "source": "tuf",
        "difficulty": "Hard",
        "url": "https://takeuforward.org/plus/dsa/problems/longest-common-subsequence"
      },
      {
        "title": "Longest Common Substring | (DP - 27)",
        "source": "tuf",
        "difficulty": "Medium",
        "url": "https://takeuforward.org/plus/dsa/problems/longest-common-substring"
      },
      {
        "title": "Longest Palindromic Subsequence | (DP-28)",
        "source": "leetcode",
        "difficulty": "Medium",
        "url": "https://leetcode.com/problems/longest-palindromic-subsequence"
      },
      {
        "title": "Minimum insertions to make string palindrome | DP-29",
        "source": "leetcode",
        "difficulty": "Hard",
        "url": "https://leetcode.com/problems/minimum-insertion-steps-to-make-a-string-palindrome"
      },
      {
        "title": "Minimum Insertions/Deletions to Convert String | (DP- 30)",
        "source": "leetcode",
        "difficulty": "Medium",
        "url": "https://leetcode.com/problems/delete-operation-for-two-strings"
      },
      {
        "title": "Shortest Common Supersequence | (DP - 31)",
        "source": "leetcode",
        "difficulty": "Hard",
        "url": "https://leetcode.com/problems/shortest-common-supersequence"
      },
      {
        "title": "Distinct Subsequences| (DP-32)",
        "source": "leetcode",
        "difficulty": "Hard",
        "url": "https://leetcode.com/problems/distinct-subsequences"
      },
      {
        "title": "Edit Distance | (DP-33)",
        "source": "leetcode",
        "difficulty": "Medium",
        "url": "https://leetcode.com/problems/edit-distance"
      },
      {
        "title": "Wildcard Matching | (DP-34)",
        "source": "leetcode",
        "difficulty": "Hard",
        "url": "https://leetcode.com/problems/wildcard-matching"
      }
    ]
  },
  {
    "name": "Advanced Math",
    "week": 11,
    "problems": [
      {
        "title": "Print Prime Factors of a Number",
        "source": "tuf",
        "difficulty": "Medium",
        "url": "https://takeuforward.org/plus/dsa/problems/prime-factorisation-of-a-number"
      },
      {
        "title": "All Divisors of a Number",
        "source": "tuf",
        "difficulty": "Easy",
        "url": "https://takeuforward.org/plus/dsa/problems/divisors-of-a-number"
      },
      {
        "title": "Sieve of Eratosthenes",
        "source": "leetcode",
        "difficulty": "Medium",
        "url": "https://leetcode.com/problems/count-primes"
      },
      {
        "title": "Find Prime Factorisation of a Number using Sieve",
        "source": "tuf",
        "difficulty": "Medium",
        "url": "https://takeuforward.org/plus/dsa/problems/prime-factorisation-of-a-number"
      },
      {
        "title": "Power(n, x)",
        "source": "leetcode",
        "difficulty": "Medium",
        "url": "https://leetcode.com/problems/powx-n"
      }
    ]
  },
  {
    "name": "Bit Manipulation",
    "week": 11,
    "problems": [
      {
        "title": "Introduction to Bit Manipulation [Theory]",
        "source": "tuf",
        "difficulty": "Easy",
        "url": "https://takeuforward.org/plus/dsa/problems/introduction-to-bits-and-tricks"
      },
      {
        "title": "Check if the i-th bit is set or not",
        "source": "tuf",
        "difficulty": "Easy",
        "url": "https://takeuforward.org/plus/dsa/problems/check-if-the-i-th-bit-is-set-or-not"
      },
      {
        "title": "Check if a number is odd or not",
        "source": "tuf",
        "difficulty": "Basic",
        "url": "https://takeuforward.org/plus/dsa/problems/check-if-a-number-is-odd-or-not"
      },
      {
        "title": "Check if a number is power of 2 or not",
        "source": "leetcode",
        "difficulty": "Easy",
        "url": "https://leetcode.com/problems/power-of-two"
      },
      {
        "title": "Count the number of set bits",
        "source": "tuf",
        "difficulty": "Medium",
        "url": "https://takeuforward.org/plus/dsa/problems/count-the-number-of-set-bits"
      },
      {
        "title": "Set/Unset the rightmost unset bit",
        "source": "hackerrank",
        "difficulty": "Easy",
        "url": "https://www.hackerrank.com/challenges/maximizing-xor"
      },
      {
        "title": "Swap two numbers",
        "source": "tuf",
        "difficulty": "Basic",
        "url": "https://takeuforward.org/plus/dsa/problems/swap-two-numbers"
      },
      {
        "title": "Divide two integers without using multiplication, division and mod operator",
        "source": "leetcode",
        "difficulty": "Medium",
        "url": "https://leetcode.com/problems/divide-two-integers"
      },
      {
        "title": "Count number of bits to be flipped to convert A to B",
        "source": "leetcode",
        "difficulty": "Easy",
        "url": "https://leetcode.com/problems/minimum-bit-flips-to-convert-number"
      },
      {
        "title": "Find the number that appears odd number of times",
        "source": "leetcode",
        "difficulty": "Easy",
        "url": "https://leetcode.com/problems/single-number"
      },
      {
        "title": "Power Set",
        "source": "leetcode",
        "difficulty": "Medium",
        "url": "https://leetcode.com/problems/subsets"
      },
      {
        "title": "Find xor of numbers from L to R",
        "source": "tuf",
        "difficulty": "Easy",
        "url": "https://takeuforward.org/plus/dsa/problems/xor-of-numbers-in-a-given-range"
      },
      {
        "title": "Find the two numbers appearing odd number of times",
        "source": "tuf",
        "difficulty": "Medium",
        "url": "https://takeuforward.org/plus/dsa/problems/single-number---iii"
      }
    ]
  },
  {
    "name": "Greedy Choice",
    "week": 11,
    "problems": [
      {
        "title": "Assign Cookies",
        "source": "leetcode",
        "difficulty": "Easy",
        "url": "https://leetcode.com/problems/assign-cookies"
      },
      {
        "title": "Fractional Knapsack Problem",
        "source": "tuf",
        "difficulty": "Medium",
        "url": "https://takeuforward.org/plus/dsa/problems/fractional-knapsack"
      },
      {
        "title": "Greedy algorithm to find minimum number of coins",
        "source": "tuf",
        "difficulty": "Easy",
        "url": "https://takeuforward.org/plus/dsa/problems/minimum-coins"
      },
      {
        "title": "Lemonade Change",
        "source": "leetcode",
        "difficulty": "Easy",
        "url": "https://leetcode.com/problems/lemonade-change"
      },
      {
        "title": "Valid Paranthesis Checker",
        "source": "leetcode",
        "difficulty": "Medium",
        "url": "https://leetcode.com/problems/valid-parenthesis-string"
      },
      {
        "title": "Jump Game",
        "source": "leetcode",
        "difficulty": "Medium",
        "url": "https://leetcode.com/problems/jump-game"
      },
      {
        "title": "Jump Game 2",
        "source": "leetcode",
        "difficulty": "Medium",
        "url": "https://leetcode.com/problems/jump-game-ii"
      },
      {
        "title": "Job sequencing Problem",
        "source": "tuf",
        "difficulty": "Medium",
        "url": "https://takeuforward.org/plus/dsa/problems/job-sequencing-problem"
      },
      {
        "title": "Candy",
        "source": "leetcode",
        "difficulty": "Hard",
        "url": "https://leetcode.com/problems/candy"
      },
      {
        "title": "Program for Shortest Job First (or SJF) CPU Scheduling",
        "source": "tuf",
        "difficulty": "Medium",
        "url": "https://takeuforward.org/plus/dsa/problems/shortest-job-first"
      },
      {
        "title": "Program for Least Recently Used (LRU) Page Replacement Algorithm",
        "source": "tuf",
        "difficulty": "Easy",
        "url": "https://takeuforward.org/plus/dsa/problems/lru-cache"
      }
    ]
  },
  {
    "name": "Greedy Interval Scheduling",
    "week": 11,
    "problems": [
      {
        "title": "N meetings in one room",
        "source": "tuf",
        "difficulty": "Easy",
        "url": "https://takeuforward.org/plus/dsa/problems/n-meetings-in-one-room"
      },
      {
        "title": "Minimum number of platforms required for a railway",
        "source": "tuf",
        "difficulty": "Medium",
        "url": "https://takeuforward.org/plus/dsa/problems/minimum-number-of-platforms-required-for-a-railway"
      },
      {
        "title": "Insert Interval",
        "source": "leetcode",
        "difficulty": "Medium",
        "url": "https://leetcode.com/problems/insert-interval"
      },
      {
        "title": "Merge Intervals",
        "source": "leetcode",
        "difficulty": "Medium",
        "url": "https://leetcode.com/problems/merge-intervals"
      },
      {
        "title": "Non-overlapping Intervals",
        "source": "leetcode",
        "difficulty": "Medium",
        "url": "https://leetcode.com/problems/non-overlapping-intervals"
      }
    ]
  },
  {
    "name": "Math and Number Theory",
    "week": 11,
    "problems": [
      {
        "title": "Count Digits",
        "source": "tuf",
        "difficulty": "Easy",
        "url": "https://takeuforward.org/plus/dsa/problems/count-all-digits-of-a-number"
      },
      {
        "title": "Reverse a Number",
        "source": "leetcode",
        "difficulty": "Medium",
        "url": "https://leetcode.com/problems/reverse-integer"
      },
      {
        "title": "Check Palindrome",
        "source": "leetcode",
        "difficulty": "Easy",
        "url": "https://leetcode.com/problems/palindrome-number"
      },
      {
        "title": "GCD Or HCF",
        "source": "tuf",
        "difficulty": "Basic",
        "url": "https://takeuforward.org/plus/dsa/problems/gcd-of-two-numbers"
      },
      {
        "title": "Armstrong Numbers",
        "source": "leetcode",
        "difficulty": "Easy",
        "url": "https://leetcode.com/problems/armstrong-number"
      },
      {
        "title": "Print all Divisors",
        "source": "tuf",
        "difficulty": "Easy",
        "url": "https://takeuforward.org/plus/dsa/problems/divisors-of-a-number"
      },
      {
        "title": "Check for Prime",
        "source": "tuf",
        "difficulty": "Medium",
        "url": "https://takeuforward.org/plus/dsa/problems/check-for-prime-number"
      }
    ]
  },
  {
    "name": "Advanced Palindrome Algorithms",
    "week": 12,
    "problems": [
      {
        "title": "Shortest Palindrome",
        "source": "leetcode",
        "difficulty": "Hard",
        "url": "https://leetcode.com/problems/shortest-palindrome"
      },
      {
        "title": "Count palindromic subsequence in given string",
        "source": "tuf",
        "difficulty": "Medium",
        "url": "https://takeuforward.org/plus/dsa/problems/count-palindromic-subsequences"
      }
    ]
  },
  {
    "name": "String Matching Algorithms",
    "week": 12,
    "problems": [
      {
        "title": "Rabin Karp",
        "source": "leetcode",
        "difficulty": "Medium",
        "url": "https://leetcode.com/problems/repeated-string-match"
      },
      {
        "title": "Z-Function",
        "source": "leetcode",
        "difficulty": "Easy",
        "url": "https://leetcode.com/problems/find-the-index-of-the-first-occurrence-in-a-string"
      },
      {
        "title": "KMP algo / LPS(pi) array",
        "source": "leetcode",
        "difficulty": "Easy",
        "url": "https://leetcode.com/problems/find-the-index-of-the-first-occurrence-in-a-string"
      },
      {
        "title": "Longest happy prefix",
        "source": "leetcode",
        "difficulty": "Hard",
        "url": "https://leetcode.com/problems/longest-happy-prefix"
      }
    ]
  }
]
