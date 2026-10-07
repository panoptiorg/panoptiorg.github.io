---
# A draft: not published until it moves to _posts/YYYY-MM-DD-tarjan-scc.md.
# Preview drafts locally with: npm run serve -- --drafts
title: Tarjan's strongly connected components
topic: graphs
description: One depth-first pass over a directed graph, two numbers per node, and a stack. At the end every node belongs to exactly one group of nodes that can all reach each other.
used: phase 1, summary order
panopticode: >-
  The engine splits the call graph of every loaded repository into SCCs with an iterative
  Tarjan pass, callees first. A function outside any cycle is summarised once. A recursive SCC
  starts from empty summaries and is recomputed until nothing changes, capped at
  `4 × |SCC| + 8` iterations. Functions in recursive SCCs are never cached.
panopticode_link: /panopticode/#summarize
panopticode_link_text: how panopticode works, step 07
references:
  - "Tarjan, R. E. (1972). Depth-first search and linear graph algorithms. *SIAM Journal on Computing*, 1(2), 146–160."
  - "[MORE REFERENCES]"
---

## The question

A strongly connected component (SCC) is a largest set of nodes where every node can reach every other. In a call graph, an SCC is a group of mutually recursive functions. Collapse each SCC to a single node and what remains has no cycles, so it can be processed in order, leaves first.

Robert Tarjan's 1972 algorithm finds all of them in a single depth-first search, in time linear in nodes plus edges.

## Two numbers per node

**index** is the order in which the search first reaches the node. **lowlink** is the smallest index reachable from the node through its subtree plus at most one edge back to a node still on the stack. When a node finishes with `lowlink == index`, nothing below it reaches higher: it is the root of an SCC, and the SCC is everything above it on the stack.

<!-- the interactive step-through goes here: <div data-tarjan></div> + scripts: [/assets/js/posts/tarjan-scc.js] -->

## The algorithm

```
strong(v):
  index[v] = lowlink[v] = counter++
  push v; onStack[v] = true
  for w in succ(v):
    if index[w] undefined:
      strong(w)
      lowlink[v] = min(lowlink[v], lowlink[w])
    else if onStack[w]:
      lowlink[v] = min(lowlink[v], index[w])
  if lowlink[v] == index[v]:
    pop until v  → one SCC
```

## Cost

Each node is pushed and popped once, and each edge is looked at once: O(V + E) time, O(V) extra space. The recursive form also uses O(V) call stack, which on a call graph of a few hundred thousand functions is a real risk of overflow. Production implementations, panopticode's included, run the same search with an explicit stack of frames.

## Alternatives

Kosaraju's algorithm uses two passes and the transposed graph; simpler to explain, twice the traversal. Pearce's variant drops the separate lowlink array to save memory. [EXPAND OR CUT]
