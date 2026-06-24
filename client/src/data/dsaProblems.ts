export type Difficulty = "Easy" | "Medium" | "Hard";

export interface DSAProblem {
  id: string;
  title: string;
  difficulty: Difficulty;
  hint: string;
  leetcodeSlug: string;
  topic: string;
}

export const dsaTopics = [
  "Array",
  "String",
  "Linked List",
  "Tree",
  "Graph",
  "DP",
  "Sorting",
  "Hashing",
  "Stack/Queue",
  "Binary Search",
  "Recursion",
  "Greedy",
];

export const dsaProblems: DSAProblem[] = [
  // Array
  { id: "arr-1", title: "Two Sum", difficulty: "Easy", hint: "Use a hash map to store seen elements", leetcodeSlug: "two-sum", topic: "Array" },
  { id: "arr-2", title: "Best Time to Buy and Sell Stock", difficulty: "Easy", hint: "Track the minimum price seen so far", leetcodeSlug: "best-time-to-buy-and-sell-stock", topic: "Array" },
  { id: "arr-3", title: "Contains Duplicate", difficulty: "Easy", hint: "Use a Set to track seen elements", leetcodeSlug: "contains-duplicate", topic: "Array" },
  { id: "arr-4", title: "Product of Array Except Self", difficulty: "Medium", hint: "Calculate prefix and suffix products", leetcodeSlug: "product-of-array-except-self", topic: "Array" },
  { id: "arr-5", title: "Maximum Subarray", difficulty: "Medium", hint: "Kadane's algorithm", leetcodeSlug: "maximum-subarray", topic: "Array" },
  { id: "arr-6", title: "Maximum Product Subarray", difficulty: "Medium", hint: "Keep track of both max and min products", leetcodeSlug: "maximum-product-subarray", topic: "Array" },
  { id: "arr-7", title: "Find Minimum in Rotated Sorted Array", difficulty: "Medium", hint: "Binary search looking for the inflection point", leetcodeSlug: "find-minimum-in-rotated-sorted-array", topic: "Array" },
  { id: "arr-8", title: "3Sum", difficulty: "Medium", hint: "Sort the array and use two pointers", leetcodeSlug: "3sum", topic: "Array" },
  
  // String
  { id: "str-1", title: "Valid Palindrome", difficulty: "Easy", hint: "Two pointers from ends towards middle", leetcodeSlug: "valid-palindrome", topic: "String" },
  { id: "str-2", title: "Valid Anagram", difficulty: "Easy", hint: "Count character frequencies", leetcodeSlug: "valid-anagram", topic: "String" },
  { id: "str-3", title: "Longest Substring Without Repeating Characters", difficulty: "Medium", hint: "Sliding window with a hash set", leetcodeSlug: "longest-substring-without-repeating-characters", topic: "String" },
  { id: "str-4", title: "Longest Repeating Character Replacement", difficulty: "Medium", hint: "Sliding window tracking max frequency character", leetcodeSlug: "longest-repeating-character-replacement", topic: "String" },
  { id: "str-5", title: "Group Anagrams", difficulty: "Medium", hint: "Use sorted string or char count as hash key", leetcodeSlug: "group-anagrams", topic: "String" },
  { id: "str-6", title: "Valid Parentheses", difficulty: "Easy", hint: "Use a stack to track opening brackets", leetcodeSlug: "valid-parentheses", topic: "String" },
  { id: "str-7", title: "Longest Palindromic Substring", difficulty: "Medium", hint: "Expand around center", leetcodeSlug: "longest-palindromic-substring", topic: "String" },
  { id: "str-8", title: "Palindromic Substrings", difficulty: "Medium", hint: "Expand around center for each possible center", leetcodeSlug: "palindromic-substrings", topic: "String" },
  
  // Linked List
  { id: "ll-1", title: "Reverse Linked List", difficulty: "Easy", hint: "Keep track of previous, current, and next nodes", leetcodeSlug: "reverse-linked-list", topic: "Linked List" },
  { id: "ll-2", title: "Merge Two Sorted Lists", difficulty: "Easy", hint: "Use a dummy node and compare heads", leetcodeSlug: "merge-two-sorted-lists", topic: "Linked List" },
  { id: "ll-3", title: "Linked List Cycle", difficulty: "Easy", hint: "Fast and slow pointers (Floyd's algorithm)", leetcodeSlug: "linked-list-cycle", topic: "Linked List" },
  { id: "ll-4", title: "Reorder List", difficulty: "Medium", hint: "Find middle, reverse second half, merge", leetcodeSlug: "reorder-list", topic: "Linked List" },
  { id: "ll-5", title: "Remove Nth Node From End of List", difficulty: "Medium", hint: "Two pointers with a gap of N", leetcodeSlug: "remove-nth-node-from-end-of-list", topic: "Linked List" },
  { id: "ll-6", title: "Merge k Sorted Lists", difficulty: "Hard", hint: "Divide and conquer or Min-Heap", leetcodeSlug: "merge-k-sorted-lists", topic: "Linked List" },
  { id: "ll-7", title: "Middle of the Linked List", difficulty: "Easy", hint: "Fast and slow pointers", leetcodeSlug: "middle-of-the-linked-list", topic: "Linked List" },
  { id: "ll-8", title: "Palindrome Linked List", difficulty: "Easy", hint: "Find middle, reverse second half, compare", leetcodeSlug: "palindrome-linked-list", topic: "Linked List" },

  // Tree
  { id: "tree-1", title: "Invert Binary Tree", difficulty: "Easy", hint: "Recursively swap left and right children", leetcodeSlug: "invert-binary-tree", topic: "Tree" },
  { id: "tree-2", title: "Maximum Depth of Binary Tree", difficulty: "Easy", hint: "1 + max(depth(left), depth(right))", leetcodeSlug: "maximum-depth-of-binary-tree", topic: "Tree" },
  { id: "tree-3", title: "Same Tree", difficulty: "Easy", hint: "Recursively check left and right subtrees", leetcodeSlug: "same-tree", topic: "Tree" },
  { id: "tree-4", title: "Subtree of Another Tree", difficulty: "Easy", hint: "Check if same tree for each node", leetcodeSlug: "subtree-of-another-tree", topic: "Tree" },
  { id: "tree-5", title: "Lowest Common Ancestor of a BST", difficulty: "Medium", hint: "Utilize BST property", leetcodeSlug: "lowest-common-ancestor-of-a-binary-search-tree", topic: "Tree" },
  { id: "tree-6", title: "Binary Tree Level Order Traversal", difficulty: "Medium", hint: "Use a queue for BFS", leetcodeSlug: "binary-tree-level-order-traversal", topic: "Tree" },
  { id: "tree-7", title: "Validate Binary Search Tree", difficulty: "Medium", hint: "Keep track of min and max boundaries", leetcodeSlug: "validate-binary-search-tree", topic: "Tree" },
  { id: "tree-8", title: "Kth Smallest Element in a BST", difficulty: "Medium", hint: "Inorder traversal gives sorted order", leetcodeSlug: "kth-smallest-element-in-a-bst", topic: "Tree" },

  // Graph
  { id: "graph-1", title: "Clone Graph", difficulty: "Medium", hint: "Use DFS/BFS and a hash map for visited nodes", leetcodeSlug: "clone-graph", topic: "Graph" },
  { id: "graph-2", title: "Course Schedule", difficulty: "Medium", hint: "Detect cycle using DFS or Kahn's algorithm (Topological Sort)", leetcodeSlug: "course-schedule", topic: "Graph" },
  { id: "graph-3", title: "Number of Islands", difficulty: "Medium", hint: "DFS/BFS to explore each island", leetcodeSlug: "number-of-islands", topic: "Graph" },
  { id: "graph-4", title: "Pacific Atlantic Water Flow", difficulty: "Medium", hint: "DFS/BFS from the oceans inwards", leetcodeSlug: "pacific-atlantic-water-flow", topic: "Graph" },
  { id: "graph-5", title: "Word Search", difficulty: "Medium", hint: "Backtracking / DFS on the grid", leetcodeSlug: "word-search", topic: "Graph" },
  { id: "graph-6", title: "Longest Consecutive Sequence", difficulty: "Medium", hint: "Use a HashSet to find starts of sequences", leetcodeSlug: "longest-consecutive-sequence", topic: "Graph" },
  { id: "graph-7", title: "Alien Dictionary", difficulty: "Hard", hint: "Build graph and find topological sort", leetcodeSlug: "alien-dictionary", topic: "Graph" },
  { id: "graph-8", title: "Graph Valid Tree", difficulty: "Medium", hint: "Check for cycle and connectivity", leetcodeSlug: "graph-valid-tree", topic: "Graph" },

  // DP
  { id: "dp-1", title: "Climbing Stairs", difficulty: "Easy", hint: "Fibonacci sequence", leetcodeSlug: "climbing-stairs", topic: "DP" },
  { id: "dp-2", title: "Coin Change", difficulty: "Medium", hint: "Bottom-up DP, dp[i] = min coins for amount i", leetcodeSlug: "coin-change", topic: "DP" },
  { id: "dp-3", title: "Longest Increasing Subsequence", difficulty: "Medium", hint: "dp[i] = max length ending at i", leetcodeSlug: "longest-increasing-subsequence", topic: "DP" },
  { id: "dp-4", title: "Word Break", difficulty: "Medium", hint: "dp[i] = true if string up to i can be segmented", leetcodeSlug: "word-break", topic: "DP" },
  { id: "dp-5", title: "Combination Sum IV", difficulty: "Medium", hint: "Similar to Coin Change but permutations matter", leetcodeSlug: "combination-sum-iv", topic: "DP" },
  { id: "dp-6", title: "House Robber", difficulty: "Medium", hint: "dp[i] = max(dp[i-1], dp[i-2] + nums[i])", leetcodeSlug: "house-robber", topic: "DP" },
  { id: "dp-7", title: "House Robber II", difficulty: "Medium", hint: "Run House Robber twice (exclude first, exclude last)", leetcodeSlug: "house-robber-ii", topic: "DP" },
  { id: "dp-8", title: "Decode Ways", difficulty: "Medium", hint: "Check 1-digit and 2-digit validity", leetcodeSlug: "decode-ways", topic: "DP" },

  // Sorting
  { id: "sort-1", title: "Merge Intervals", difficulty: "Medium", hint: "Sort by start time", leetcodeSlug: "merge-intervals", topic: "Sorting" },
  { id: "sort-2", title: "Insert Interval", difficulty: "Medium", hint: "Add new interval and merge", leetcodeSlug: "insert-interval", topic: "Sorting" },
  { id: "sort-3", title: "Sort Colors", difficulty: "Medium", hint: "Dutch National Flag algorithm (3 pointers)", leetcodeSlug: "sort-colors", topic: "Sorting" },
  { id: "sort-4", title: "Top K Frequent Elements", difficulty: "Medium", hint: "Bucket sort or Min-Heap", leetcodeSlug: "top-k-frequent-elements", topic: "Sorting" },
  { id: "sort-5", title: "Kth Largest Element in an Array", difficulty: "Medium", hint: "Quickselect or Min-Heap", leetcodeSlug: "kth-largest-element-in-an-array", topic: "Sorting" },
  { id: "sort-6", title: "Find Peak Element", difficulty: "Medium", hint: "Binary search", leetcodeSlug: "find-peak-element", topic: "Sorting" },
  { id: "sort-7", title: "Sort an Array", difficulty: "Medium", hint: "Merge Sort or Heap Sort", leetcodeSlug: "sort-an-array", topic: "Sorting" },
  { id: "sort-8", title: "Wiggle Sort II", difficulty: "Medium", hint: "Sort and interleave smaller/larger halves", leetcodeSlug: "wiggle-sort-ii", topic: "Sorting" },

  // Hashing
  { id: "hash-1", title: "Roman to Integer", difficulty: "Easy", hint: "Map symbols to values, subtract if smaller precedes larger", leetcodeSlug: "roman-to-integer", topic: "Hashing" },
  { id: "hash-2", title: "Isomorphic Strings", difficulty: "Easy", hint: "Map characters from s to t and t to s", leetcodeSlug: "isomorphic-strings", topic: "Hashing" },
  { id: "hash-3", title: "Word Pattern", difficulty: "Easy", hint: "Map pattern chars to words", leetcodeSlug: "word-pattern", topic: "Hashing" },
  { id: "hash-4", title: "Find All Anagrams in a String", difficulty: "Medium", hint: "Sliding window with character frequency arrays", leetcodeSlug: "find-all-anagrams-in-a-string", topic: "Hashing" },
  { id: "hash-5", title: "Subarray Sum Equals K", difficulty: "Medium", hint: "Prefix sum and hash map", leetcodeSlug: "subarray-sum-equals-k", topic: "Hashing" },
  { id: "hash-6", title: "Insert Delete GetRandom O(1)", difficulty: "Medium", hint: "Use Hash Map and Array together", leetcodeSlug: "insert-delete-getrandom-o1", topic: "Hashing" },
  { id: "hash-7", title: "Design HashMap", difficulty: "Easy", hint: "Array of linked lists for chaining", leetcodeSlug: "design-hashmap", topic: "Hashing" },
  { id: "hash-8", title: "Contiguous Array", difficulty: "Medium", hint: "Treat 0 as -1 and use prefix sum with hash map", leetcodeSlug: "contiguous-array", topic: "Hashing" },

  // Stack/Queue
  { id: "sq-1", title: "Min Stack", difficulty: "Medium", hint: "Keep two stacks or store pairs (val, current_min)", leetcodeSlug: "min-stack", topic: "Stack/Queue" },
  { id: "sq-2", title: "Evaluate Reverse Polish Notation", difficulty: "Medium", hint: "Stack for operands", leetcodeSlug: "evaluate-reverse-polish-notation", topic: "Stack/Queue" },
  { id: "sq-3", title: "Daily Temperatures", difficulty: "Medium", hint: "Monotonic decreasing stack", leetcodeSlug: "daily-temperatures", topic: "Stack/Queue" },
  { id: "sq-4", title: "Generate Parentheses", difficulty: "Medium", hint: "Backtracking, keep track of open/close counts", leetcodeSlug: "generate-parentheses", topic: "Stack/Queue" },
  { id: "sq-5", title: "Implement Queue using Stacks", difficulty: "Easy", hint: "Use two stacks, one for enqueue, one for dequeue", leetcodeSlug: "implement-queue-using-stacks", topic: "Stack/Queue" },
  { id: "sq-6", title: "Implement Stack using Queues", difficulty: "Easy", hint: "Use one queue and rotate elements", leetcodeSlug: "implement-stack-using-queues", topic: "Stack/Queue" },
  { id: "sq-7", title: "Largest Rectangle in Histogram", difficulty: "Hard", hint: "Monotonic increasing stack", leetcodeSlug: "largest-rectangle-in-histogram", topic: "Stack/Queue" },
  { id: "sq-8", title: "Sliding Window Maximum", difficulty: "Hard", hint: "Monotonic decreasing deque", leetcodeSlug: "sliding-window-maximum", topic: "Stack/Queue" },

  // Binary Search
  { id: "bs-1", title: "Binary Search", difficulty: "Easy", hint: "Standard left/right pointers", leetcodeSlug: "binary-search", topic: "Binary Search" },
  { id: "bs-2", title: "Search a 2D Matrix", difficulty: "Medium", hint: "Treat 2D matrix as a sorted 1D array", leetcodeSlug: "search-a-2d-matrix", topic: "Binary Search" },
  { id: "bs-3", title: "Koko Eating Bananas", difficulty: "Medium", hint: "Binary search on the eating speed", leetcodeSlug: "koko-eating-bananas", topic: "Binary Search" },
  { id: "bs-4", title: "Search in Rotated Sorted Array", difficulty: "Medium", hint: "Determine which half is sorted first", leetcodeSlug: "search-in-rotated-sorted-array", topic: "Binary Search" },
  { id: "bs-5", title: "Time Based Key-Value Store", difficulty: "Medium", hint: "Binary search on timestamps for a given key", leetcodeSlug: "time-based-key-value-store", topic: "Binary Search" },
  { id: "bs-6", title: "Median of Two Sorted Arrays", difficulty: "Hard", hint: "Binary search on the smaller array's partition", leetcodeSlug: "median-of-two-sorted-arrays", topic: "Binary Search" },
  { id: "bs-7", title: "Find First and Last Position of Element in Sorted Array", difficulty: "Medium", hint: "Binary search twice (lower bound, upper bound)", leetcodeSlug: "find-first-and-last-position-of-element-in-sorted-array", topic: "Binary Search" },
  { id: "bs-8", title: "Search Insert Position", difficulty: "Easy", hint: "Standard binary search, return left pointer", leetcodeSlug: "search-insert-position", topic: "Binary Search" },

  // Recursion
  { id: "rec-1", title: "Subsets", difficulty: "Medium", hint: "Backtracking to include or exclude each element", leetcodeSlug: "subsets", topic: "Recursion" },
  { id: "rec-2", title: "Combination Sum", difficulty: "Medium", hint: "Backtracking, allowing reuse of elements", leetcodeSlug: "combination-sum", topic: "Recursion" },
  { id: "rec-3", title: "Permutations", difficulty: "Medium", hint: "Backtracking, swap elements or use a visited array", leetcodeSlug: "permutations", topic: "Recursion" },
  { id: "rec-4", title: "Subsets II", difficulty: "Medium", hint: "Sort first, skip duplicates during backtracking", leetcodeSlug: "subsets-ii", topic: "Recursion" },
  { id: "rec-5", title: "Palindrome Partitioning", difficulty: "Medium", hint: "Backtracking, check if prefix is palindrome", leetcodeSlug: "palindrome-partitioning", topic: "Recursion" },
  { id: "rec-6", title: "Letter Combinations of a Phone Number", difficulty: "Medium", hint: "Backtracking, map digits to letters", leetcodeSlug: "letter-combinations-of-a-phone-number", topic: "Recursion" },
  { id: "rec-7", title: "N-Queens", difficulty: "Hard", hint: "Backtracking, keep track of columns and diagonals", leetcodeSlug: "n-queens", topic: "Recursion" },
  { id: "rec-8", title: "Sudoku Solver", difficulty: "Hard", hint: "Backtracking, try 1-9 for each empty cell", leetcodeSlug: "sudoku-solver", topic: "Recursion" },

  // Greedy
  { id: "gr-1", title: "Jump Game", difficulty: "Medium", hint: "Track maximum reachable index", leetcodeSlug: "jump-game", topic: "Greedy" },
  { id: "gr-2", title: "Jump Game II", difficulty: "Medium", hint: "Track current max reach and next max reach", leetcodeSlug: "jump-game-ii", topic: "Greedy" },
  { id: "gr-3", title: "Gas Station", difficulty: "Medium", hint: "If total gas >= total cost, solution exists. Track current surplus", leetcodeSlug: "gas-station", topic: "Greedy" },
  { id: "gr-4", title: "Hand of Straights", difficulty: "Medium", hint: "Use Min-Heap or TreeMap to group cards", leetcodeSlug: "hand-of-straights", topic: "Greedy" },
  { id: "gr-5", title: "Merge Triplets to Form Target Triplet", difficulty: "Medium", hint: "Filter invalid triplets, then check if max of each position matches target", leetcodeSlug: "merge-triplets-to-form-target-triplet", topic: "Greedy" },
  { id: "gr-6", title: "Partition Labels", difficulty: "Medium", hint: "Track last occurrence of each character", leetcodeSlug: "partition-labels", topic: "Greedy" },
  { id: "gr-7", title: "Valid Parenthesis String", difficulty: "Medium", hint: "Track min and max possible open parentheses", leetcodeSlug: "valid-parenthesis-string", topic: "Greedy" },
  { id: "gr-8", title: "Assign Cookies", difficulty: "Easy", hint: "Sort both arrays and use two pointers", leetcodeSlug: "assign-cookies", topic: "Greedy" },
];
