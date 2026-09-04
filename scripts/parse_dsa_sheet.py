from __future__ import annotations

import json
import re
import sys
from pathlib import Path

DIFFICULTIES = {"Basic", "Easy", "Medium", "Hard"}
PROVIDERS = {"leetcode", "tuf", "hackerrank", "interviewbit", "spoj"}
SUPPLEMENTAL_PROBLEMS = [
    ("Minimum number of bracket reversals needed to make an expression balanced", "leetcode", "Medium", "Expression Parsing with Stacks", 3),
    ("Count and say", "leetcode", "Medium", "String Parsing and Transformation", 2),
    ("Hashing In Strings | Theory", "leetcode", "Easy", "String Hashing and Counting", 4),
    ("Rabin Karp", "leetcode", "Medium", "String Matching Algorithms", 12),
    ("Z-Function", "leetcode", "Easy", "String Matching Algorithms", 12),
    ("KMP algo / LPS(pi) array", "leetcode", "Easy", "String Matching Algorithms", 12),
    ("Shortest Palindrome", "leetcode", "Hard", "Advanced Palindrome Algorithms", 12),
    ("Longest happy prefix", "leetcode", "Hard", "String Matching Algorithms", 12),
    ("Count palindromic subsequence in given string", "tuf", "Medium", "Advanced Palindrome Algorithms", 12),
    ("Binary Search to find X in sorted array", "leetcode", "Easy", "Binary Search on Sorted Data", 9),
    ("Implement Lower Bound", "tuf", "Easy", "Binary Search on Sorted Data", 9),
    ("Implement Upper Bound", "tuf", "Easy", "Binary Search on Sorted Data", 9),
    ("Search Insert Position", "leetcode", "Easy", "Binary Search on Sorted Data", 9),
    ("Floor/Ceil in Sorted Array", "tuf", "Medium", "Binary Search on Sorted Data", 9),
    ("Find the first or last occurrence of a given number in a sorted array", "leetcode", "Medium", "Binary Search on Sorted Data", 9),
    ("Count occurrences of a number in a sorted array with duplicates", "tuf", "Easy", "Binary Search on Sorted Data", 9),
    ("Search in Rotated Sorted Array I", "leetcode", "Medium", "Binary Search on Sorted Data", 9),
    ("Search in Rotated Sorted Array II", "leetcode", "Medium", "Binary Search on Sorted Data", 9),
    ("Find minimum in Rotated Sorted Array", "leetcode", "Medium", "Binary Search on Sorted Data", 9),
    ("Find out how many times has an array been rotated", "tuf", "Easy", "Binary Search on Sorted Data", 9),
    ("Single element in a Sorted Array", "leetcode", "Medium", "Binary Search on Sorted Data", 9),
    ("Find peak element", "leetcode", "Medium", "Binary Search on Sorted Data", 9),
]

TOP_LEVELS = {
    "Learn the basics",
    "Solve Problems on Arrays [Easy -> Medium -> Hard]",
    "Binary Search [1D, 2D Arrays, Search Space]",
    "Strings [Basic and Medium]",
    "Learn LinkedList [Single LL, Double LL, Medium, Hard Problems]",
    "Recursion [PatternWise]",
    "Bit Manipulation [Concepts & Problems]",
    "Stack and Queues [Learning, Pre-In-Post-fix, Monotonic Stack, Implementation]",
    "Sliding Window & Two Pointer Combined Problems",
    "Heaps [Learning, Medium, Hard Problems]",
    "Greedy Algorithms [Easy, Medium/Hard]",
    "Binary Trees [Traversals, Medium and Hard Problems]",
    "Binary Search Trees [Concept and Problems]",
    "Graphs [Concepts & Problems]",
    "Dynamic Programming [Patterns and Problems]",
    "Tries",
    "Strings",
}


def contains(title: str, *needles: str) -> bool:
    lowered = title.lower()
    return any(needle in lowered for needle in needles)


def classify(top: str, subsection: str, title: str) -> tuple[str, int]:
    if top == "Learn the basics":
        if "Maths" in subsection:
            return "Math and Number Theory", 11
        if "Recursion" in subsection:
            return "Recursion Fundamentals", 8
        if "Hashing" in subsection:
            return "Hashing and Frequency Counting", 4
        if "Sorting" in subsection:
            return "Sorting Algorithms", 6
        if "STL" in subsection:
            return "Python Collections", 1
        return "Programming and Complexity Basics", 1

    if top.startswith("Solve Problems on Arrays"):
        if contains(title, "matrix", "spiral", "rotate image", "set matrix"):
            return "Matrix Traversal and Transformation", 2
        if contains(title, "interval", "merge overlapping"):
            return "Intervals", 6
        if contains(title, "kadane", "maximum subarray", "stock"):
            return "Kadane and Running State", 2
        if contains(title, "subarray", "sum k", "xor"):
            return "Prefix Sum and Subarray Counting", 4
        if contains(title, "2sum", "3 sum", "3sum", "4 sum", "4sum", "two sum"):
            return "Two Pointers and Hashing", 2
        if contains(title, "majority", "frequency", "appears", "missing", "duplicate", "union", "intersection"):
            return "Array Hashing and Counting", 4
        return "Array Fundamentals", 2

    if top.startswith("Binary Search"):
        if "Answers" in subsection:
            return "Binary Search on Answer", 9
        if "2D" in subsection:
            return "Binary Search on Matrices", 9
        return "Binary Search on Sorted Data", 9

    if top == "Strings [Basic and Medium]":
        if contains(title, "palindrome", "reverse", "rotate"):
            return "String Manipulation and Palindromes", 2
        if contains(title, "anagram", "isomorphic", "frequency", "sort characters"):
            return "String Hashing and Counting", 4
        return "String Parsing and Transformation", 2

    if top.startswith("Learn LinkedList"):
        if contains(title, "cycle", "loop", "middle", "intersection"):
            return "Fast and Slow Pointer", 1
        if contains(title, "reverse", "rotate", "delete", "remove", "segregate"):
            return "Linked List Pointer Rewiring", 1
        if contains(title, "merge", "sort", "flatten", "clone", "copy"):
            return "Linked List Merge and Transformation", 1
        if "Doubly" in subsection or contains(title, "dll", "doubly"):
            return "Doubly Linked Lists", 1
        return "Linked List Fundamentals", 1

    if top == "Recursion [PatternWise]":
        if "Subsequences" in subsection:
            return "Subsets and Subsequences", 8
        if "Combos" in subsection or contains(title, "combination", "permutation", "sudoku", "n queen", "rat in"):
            return "Backtracking and Constraint Search", 8
        return "Recursive Problem Solving", 8

    if top.startswith("Bit Manipulation"):
        if "Maths" in subsection:
            return "Advanced Math", 11
        return "Bit Manipulation", 11

    if top.startswith("Stack and Queues"):
        if "Prefix" in subsection:
            return "Expression Parsing with Stacks", 3
        if "Monotonic" in subsection:
            return "Monotonic Stack and Queue", 3
        if "Implementation" in subsection:
            return "Stack, Queue and Cache Design", 3
        return "Stack and Queue Fundamentals", 3

    if top.startswith("Sliding Window"):
        return "Sliding Window and Two Pointers", 4

    if top.startswith("Heaps"):
        if subsection == "Learning":
            return "Heap Fundamentals", 6
        return "Heap and Priority Queue Patterns", 6

    if top.startswith("Greedy"):
        if contains(title, "interval", "meeting", "platform"):
            return "Greedy Interval Scheduling", 11
        return "Greedy Choice", 11

    if top.startswith("Binary Trees"):
        if subsection == "Traversals":
            return "Tree Traversals", 5
        if "Hard" in subsection:
            return "Tree Construction, Paths and Serialization", 5
        return "Tree Views and Properties", 5

    if top.startswith("Binary Search Trees"):
        return "Binary Search Trees", 5

    if top.startswith("Graphs"):
        if "BFS/DFS" in subsection:
            return "Graph BFS and DFS", 7
        if "Topo" in subsection:
            return "Topological Sort and DAGs", 7
        if "Shortest" in subsection:
            return "Shortest Path Algorithms", 7
        if "MinimumSpanning" in subsection:
            return "Minimum Spanning Tree and Union Find", 7
        if "Other" in subsection:
            return "Advanced Graph Algorithms", 7
        return "Graph Fundamentals", 7

    if top.startswith("Dynamic Programming"):
        mapping = {
            "Introduction to DP": "Dynamic Programming Fundamentals",
            "1D DP": "One-Dimensional DP",
            "2D/3D DP and DP on Grids": "Grid and Multi-Dimensional DP",
            "DP on Subsequences": "Knapsack and Subsequence DP",
            "DP on Strings": "String DP",
            "DP on Stocks": "State Machine DP",
            "DP on LIS": "Longest Increasing Subsequence",
            "MCM DP | Partition DP": "Partition DP",
            "DP on Squares": "DP on Rectangles and Squares",
        }
        return mapping.get(subsection, "Dynamic Programming Fundamentals"), 10

    if top == "Tries":
        if contains(title, "xor"):
            return "Bitwise Tries", 5
        return "Trie and Prefix Search", 5

    if top == "Strings":
        if contains(title, "rabin", "z-function", "kmp", "lps", "happy prefix"):
            return "String Matching Algorithms", 12
        if contains(title, "palindrome", "palindromic"):
            return "Advanced Palindrome Algorithms", 12
        return "Advanced String Algorithms", 12

    return "Mixed Interview Problems", 12


def parse(source: Path) -> list[dict[str, object]]:
    lines = [line.strip() for line in source.read_text(encoding="utf-8").splitlines() if line.strip()]
    problems: list[dict[str, object]] = []
    top = "Learn the basics"
    subsection = "Things to Know in C++/Java/Python or any language"
    headings = {lines[index] for index in range(len(lines) - 1) if re.fullmatch(r"0/\d+", lines[index + 1])}

    index = 0
    while index < len(lines):
        line = lines[index]
        if line in TOP_LEVELS:
            top = line
            subsection = line
        elif line in headings:
            subsection = line

        if (
            index + 2 < len(lines)
            and lines[index + 1] in PROVIDERS
            and lines[index + 2] in DIFFICULTIES
        ):
            pattern, week = classify(top, subsection, line)
            problems.append(
                {
                    "title": line,
                    "source": lines[index + 1],
                    "difficulty": lines[index + 2],
                    "pattern": pattern,
                    "week": week,
                }
            )
            index += 3
            continue
        index += 1
    existing_titles = {str(problem["title"]).lower() for problem in problems}
    for title, provider, difficulty, pattern, week in SUPPLEMENTAL_PROBLEMS:
        if title.lower() not in existing_titles:
            problems.append(
                {
                    "title": title,
                    "source": provider,
                    "difficulty": difficulty,
                    "pattern": pattern,
                    "week": week,
                }
            )
    return problems


def write_typescript(problems: list[dict[str, object]], destination: Path) -> None:
    patterns: list[dict[str, object]] = []
    for problem in problems:
        existing = next((item for item in patterns if item["name"] == problem["pattern"]), None)
        if existing is None:
            existing = {"name": problem["pattern"], "week": problem["week"], "problems": []}
            patterns.append(existing)
        existing["problems"].append(
            {
                "title": problem["title"],
                "source": problem["source"],
                "difficulty": problem["difficulty"],
            }
        )
    patterns.sort(key=lambda item: (item["week"], item["name"]))

    payload = json.dumps(patterns, indent=2, ensure_ascii=True)
    content = f"""export type Difficulty = 'Basic' | 'Easy' | 'Medium' | 'Hard'

export type DsaProblem = {{
  title: string
  source: string
  difficulty: Difficulty
  url?: string
}}

export type DsaPattern = {{
  name: string
  week: number
  problems: DsaProblem[]
}}

export const dsaPatterns: DsaPattern[] = {payload}
"""
    destination.parent.mkdir(parents=True, exist_ok=True)
    destination.write_text(content, encoding="utf-8")


if __name__ == "__main__":
    if len(sys.argv) != 3:
        raise SystemExit("Usage: parse_dsa_sheet.py SOURCE.txt DESTINATION.ts")
    parsed = parse(Path(sys.argv[1]))
    write_typescript(parsed, Path(sys.argv[2]))
    print(f"Wrote {len(parsed)} problems across {len({item['pattern'] for item in parsed})} patterns.")
