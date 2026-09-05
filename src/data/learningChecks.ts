export type LearningCheck = {
  question: string
  options: { label: string; feedback: string }[]
  answer: number
}

type Track = 'dsa' | 'hld' | 'lld'
type LessonChecks = { predict: LearningCheck; explain: LearningCheck }
type Choice = [label: string, feedback: string]

function q(
  question: string,
  choices: [Choice, Choice, Choice],
  answer: 0 | 1 | 2,
): LearningCheck {
  return {
    question,
    options: choices.map(([label, feedback]) => ({ label, feedback })),
    answer,
  }
}

const checks: Record<Track, LessonChecks[]> = {
  dsa: [
    {
      predict: q(
        'A singly linked list is A -> B -> C -> null. With prev = null and curr = A, run next = curr.next; curr.next = prev; prev = curr; curr = next. What is the state after this one reversal step?',
        [
          ['prev is A -> B -> C; curr is B.', 'Saving next does not preserve A.next. The assignment curr.next = prev replaces that link with null.'],
          ['prev is A -> null; curr is B -> C -> null.', 'A now points to the old prev, null. The saved successor keeps B and C reachable through curr.'],
          ['prev is A -> B -> A; curr is C.', 'No statement makes B point to A, and curr advances only to the saved successor B, not two nodes ahead.'],
        ],
        1,
      ),
      explain: q(
        'A -> B -> C -> null has no external references to B or C. A reversal starts with curr = A and prev = null, but overwrites curr.next before saving the original successor. Why can advancing curr now lose the unprocessed list?',
        [
          ['Reading curr.next afterward still retrieves B.', 'curr.next is a mutable link, not a history of links. After the overwrite it contains null, not B.'],
          ['Following prev recovers B because prev stores the original list.', 'prev was null and, after updating it to A, only reaches the already changed A.next. It does not retain B.'],
          ['The only link to B was overwritten; save that successor before rewiring.', 'Without another reference, the unprocessed suffix is no longer reachable. Saving the original next pointer preserves the path needed to continue.'],
        ],
        2,
      ),
    },
    {
      predict: q(
        'A two-pointer pair-sum search uses sorted [1, 2, 4, 7, 11] and target 9. Its current endpoints are 1 and 11. Which pair does it test immediately after the standard next pointer move?',
        [
          ['1 and 7.', 'The sum 12 is too large. Moving the right pointer left reduces the larger endpoint while retaining possible partners for 1.'],
          ['2 and 11.', 'Moving the left pointer right would increase an already excessive sum, so it cannot repair this comparison.'],
          ['2 and 7.', 'That pair eventually works, but reaching it takes two moves. The next comparison is 1 + 7, whose sum 8 then advances the left pointer.'],
        ],
        0,
      ),
      explain: q(
        'Now the array is unsorted: [8, 1, 6, 4], target 10. An endpoint search sees 8 + 4 > 10 and permanently discards the rightmost 4. Why is the sorted-array elimination argument invalid here?',
        [
          ['A sum above the target proves that neither endpoint belongs to any answer.', 'It only describes this pair. In this array, the discarded 4 has a valid partner, 6.'],
          ['The algorithm is safe as long as every value is positive.', 'Positivity does not order the remaining candidates. An interior value can be smaller than the left endpoint even when all values are positive.'],
          ['An interior 6 can pair with 4 to make 10, even though 8 + 4 is too large.', 'Sorted order would make the left endpoint the smallest remaining candidate. Without that guarantee, rejecting its pair cannot eliminate every other partner for 4.'],
        ],
        2,
      ),
    },
    {
      predict: q(
        'For temperatures [70, 72, 71, 73], report how many days each position waits for its next strictly warmer temperature, or 0 if none exists. What is the result?',
        [
          ['[1, 1, 1, 0]', 'The day after 72 is 71, which is colder. That unresolved position stays on the stack until 73 arrives two days later.'],
          ['[3, 2, 1, 0]', '70 already finds a warmer temperature at 72 on the very next day. Waiting for the maximum skips its first valid answer.'],
          ['[1, 2, 1, 0]', '72 resolves 70. Later, 73 resolves both 71 and 72; 73 itself has no later warmer day.'],
        ],
        2,
      ),
      explain: q(
        'A monotonic-stack search now wants the next greater-or-equal value, not the next strictly greater value. On [5, 5, 6], what should happen when the second 5 arrives?',
        [
          ['Resolve the first 5 now; pop while the stored value is <= the arriving value.', 'Equality now satisfies the query, so the first position waits only one step. Keeping equal values unresolved would answer the old, strictly-greater question.'],
          ['Leave the first 5 unresolved until 6 arrives.', 'That produces a distance of two even though an equal value one step away already meets the new requirement.'],
          ['Drop the second 5 without resolving or storing either position.', 'The two equal values occupy different positions and can have different next answers. Discarding their indices loses information needed for distances.'],
        ],
        0,
      ),
    },
    {
      predict: q(
        'In a longest-substring-without-repetition scan of "abba", the left boundary is index 2 before processing the final "a". Its previous occurrence was index 0. Using left = max(left, previousIndex + 1), what is the longest valid length overall?',
        [
          ['3, from the substring "bba".', 'The max keeps left at 2, rather than moving it backward to 1. "bba" repeats b and is not a valid window.'],
          ['2, with windows such as "ab" or "ba".', 'The old a is outside the current window, so left remains 2. The final window is "ba", and no valid window exceeds length two.'],
          ['4, because each character appears at most twice.', 'The requirement is no repeated character inside one window, not a bound of two occurrences across the input.'],
        ],
        1,
      ),
      explain: q(
        'A positive-number sliding-window algorithm seeks the shortest subarray with sum at least 3. On [1, -1, 3], it records length 3, removes the leading 1, sees sum 2, and stops shrinking. Why can the true minimum still be 1?',
        [
          ['Removing the next value, -1, raises the sum back to 3 and exposes [3].', 'Negative values break the assumption that shrinking can only decrease the sum. Stopping at sum 2 misses a later, shorter valid window.'],
          ['Length 3 must be optimal because the first shrink made the sum too small.', 'That stopping argument requires positive values. Removing the next negative value can increase the sum again.'],
          ['The prefix [1, -1] already reaches the target.', 'That prefix sums to 0. The missed solution is the suffix [3], not a different interpretation of the target.'],
        ],
        0,
      ),
    },
    {
      predict: q(
        'A tree has root A, children B and C, child D under B, and children E and F under C. A level-order BFS enqueues children left to right. After finishing the entire level containing B and C, what is in its queue?',
        [
          ['D, E, F, in that order.', 'Processing B appends D and processing C appends E then F. All three belong to the next level and wait in FIFO order.'],
          ['D only.', 'That would describe the children discovered from B alone. Finishing the level also processes C and enqueues E and F.'],
          ['F, E, D, in that order.', 'A queue does not reverse insertion order. That reversal would require stack-like removal rather than FIFO traversal.'],
        ],
        0,
      ),
      explain: q(
        'A binary tree has depth 20 edges and about one million leaves. You only need the sum of its values, not level order. Ignoring storage for the tree itself, why might recursive DFS use much less traversal memory than BFS?',
        [
          ['DFS must keep all leaves in its call stack at once.', 'A depth-first traversal returns from one branch before traversing the next. Its active call stack contains one root-to-current path.'],
          ['BFS stores only the depth because it processes one level at a time.', 'It must still retain the waiting nodes of a broad level. Processing by level does not make that frontier small.'],
          ['DFS keeps a depth-sized call stack, while BFS can retain a frontier near the number of leaves.', 'With depth only 20, the active DFS path is small. The broad bottom level makes the BFS queue large even though both traversals visit every node.'],
        ],
        2,
      ),
    },
    {
      predict: q(
        'To find the third-largest value in stream [4, 1, 7, 3, 8], keep a min-heap of at most three values and evict its minimum whenever its size becomes four. What is its root at the end?',
        [
          ['8.', '8 is the maximum of the retained values, not the root of their min-heap. The root is the smallest value among the largest three.'],
          ['3.', '3 is evicted when 8 arrives. The surviving values are 4, 7, and 8.'],
          ['4.', 'The heap retains 4, 7, and 8. Its minimum, 4, is exactly the third-largest value seen.'],
        ],
        2,
      ),
      explain: q(
        'After processing [4, 1, 7, 3, 8], a top-three heap contains only {4, 7, 8}; discarded values were not saved anywhere. The requirement changes to the fourth-largest value of that same stream. Is increasing the heap capacity to four enough?',
        [
          ['Yes; the existing root 4 automatically becomes the fourth-largest.', 'Changing capacity cannot change the rank of a retained value in the original stream. 4 is still third-largest.'],
          ['No; recover discarded history, or retain a larger summary before discarding it.', 'The required value is 3, which the current heap no longer contains. A larger capacity alone cannot reconstruct an earlier eviction.'],
          ['Yes; insert 0 to fill the fourth slot.', 'An invented value is not evidence about the input. It would produce 0 instead of the actual fourth-largest value, 3.'],
        ],
        1,
      ),
    },
    {
      predict: q(
        'An unweighted directed graph has edges S -> A, S -> B, A -> C, B -> C, and C -> D. BFS marks nodes visited when enqueuing them. How many times is C enqueued, and what is the shortest distance from S to D in edges?',
        [
          ['C is enqueued twice; D has distance 3.', 'The distance is right, but the first enqueue marks C visited. Its second incoming edge cannot enqueue it again.'],
          ['C is enqueued once; D has distance 3.', 'Either A or B first discovers C at distance 2. The visited check removes duplicate work, and D is one more edge away.'],
          ['C is enqueued once; D has distance 2.', 'The route includes three edges: S to A or B, then C, then D. Sharing a neighbor does not remove an edge.'],
        ],
        1,
      ),
      explain: q(
        'Now directed edges have costs: S -> A costs 10, S -> B costs 1, and B -> A costs 1. The goal changes from fewest edges to minimum total cost. Why can ordinary visited-on-enqueue BFS give the wrong answer for A?',
        [
          ['The direct route must be cheapest because it uses only one edge.', 'One edge costs 10 here, while the two-edge route costs 2. Hop count and total cost no longer agree.'],
          ['Treating every cost as 1 preserves the ordering of all path costs.', 'Replacing weights erases the difference between 10 and 1. That transformation changes the optimization problem.'],
          ['BFS can finalize A via the cost-10 edge before discovering the cost-2 route through B.', 'A cost-aware algorithm such as Dijkstra, valid for these nonnegative weights, can improve A to cost 2 instead of treating its first hop-based discovery as final.'],
        ],
        2,
      ),
    },
    {
      predict: q(
        'A permutation backtracker has path [A] and used = {A}. It chooses B, explores all completions below [A, B], and returns. What state must be restored before trying C in place of B?',
        [
          ['path [A], used = {A}.', 'Undo only the choice made by this frame: remove B from the path and from used. The ancestor choice A remains in effect.'],
          ['path [A], used = {A, B}.', 'Removing B only from the path leaves it falsely unavailable. The later branch [A, C] would then be unable to choose B.'],
          ['path [], used = {}.', 'That also undoes the ancestor choice A. The current frame is choosing the second position, not restarting the entire search.'],
        ],
        0,
      ),
      explain: q(
        'A backtracker must produce unique value permutations of sorted [1a, 1b, 2], where 1a and 1b are different indices holding the same value 1. Which rule avoids duplicate branches while still allowing both 1s in a permutation?',
        [
          ['Never choose 1b in any branch.', 'Every complete permutation must use both occurrences. Globally banning one occurrence removes valid results such as [1, 1, 2].'],
          ['Skip an equal candidate when its immediately preceding equal candidate is unused; allow it when that predecessor is already used.', 'At one decision level, choosing the later unused equal occurrence duplicates an earlier branch. Once the first occurrence is in the path, the second is needed to complete valid permutations.'],
          ['Only track used indices; equal values need no additional rule.', 'Index tracking prevents reusing one occurrence, but [1a, 1b, 2] and [1b, 1a, 2] still produce the same value permutation.'],
        ],
        1,
      ),
    },
    {
      predict: q(
        'A lower-bound search returns the first index whose value is at least the target. For [2, 4, 4, 7] and target 4, with zero-based indices, what should it return?',
        [
          ['2.', 'Index 2 contains 4, but it is not the first qualifying index. A lower-bound search keeps searching left after finding equality.'],
          ['3.', 'Index 3 is the first value strictly greater than 4. That is an upper bound, not the requested lower bound.'],
          ['1.', 'Index 0 is below the target and index 1 is the first value at least 4. Duplicate matches do not change the first qualifying boundary.'],
        ],
        2,
      ),
      explain: q(
        'A half-open lower-bound search over [2] for target 3 uses lo = 0, hi = 1, and mid = floor((lo + hi) / 2). Its too-small branch incorrectly sets lo = mid. Why does it stall, and what is the correct repair?',
        [
          ['mid stays 0; use lo = mid + 1 because the tested value cannot qualify.', 'Assigning lo = mid leaves both bounds unchanged. Excluding the proven-too-small position advances lo to 1, the valid insertion index after the array.'],
          ['Set hi = mid instead; the result should be index 0.', 'Index 0 contains 2, below the target. Moving the upper bound on a too-small value eliminates the actual insertion boundary.'],
          ['Round mid upward and keep lo = mid.', 'On this one-element half-open interval, upward rounding produces index 1, outside the search range. It does not fix the elimination rule.'],
        ],
        0,
      ),
    },
    {
      predict: q(
        'Count paths from the top-left to the bottom-right of a 3-by-3 grid. Moves may go only right or down, and the center cell is blocked. How many paths exist?',
        [
          ['6.', 'Six is the count without an obstacle. Four of those routes pass through the blocked center and must be excluded.'],
          ['2.', 'Only the routes along the top then right edge, or along the left then bottom edge, avoid the center.'],
          ['0.', 'The center is not mandatory. Both outer-edge routes reach the destination without entering it.'],
        ],
        1,
      ),
      explain: q(
        'A right/down path counter is changed to one-row DP. Before processing a middle row, dp = [1, 1, 1]. That row has only its center cell blocked. Why must the algorithm set dp[1] = 0 rather than merely skip that cell?',
        [
          ['Skipping is safe because dp[1] already counts only paths that avoid the obstacle.', 'The old dp[1] counts ways to reach the cell above. Leaving it nonzero incorrectly carries those paths through the blocked cell and into later cells.'],
          ['The entire dp array must be cleared because one blocked cell makes the row unreachable.', 'The left and right cells can still receive valid paths from above. Clearing everything destroys those routes.'],
          ['The old value represents incoming paths from above; zero prevents them flowing through the blocked cell.', 'After the row, dp should be [1, 0, 1]. Resetting only the obstacle blocks invalid paths while preserving the independent route entering the right cell from above.'],
        ],
        2,
      ),
    },
    {
      predict: q(
        'One room must host as many unweighted intervals as possible; an interval may start exactly when another ends. For [0,3], [1,2], [2,4], and [3,5], which intervals does the earliest-finish-time greedy algorithm select?',
        [
          ['[1,2] and [2,4].', 'The first finish is 2. [0,3] then conflicts, [2,4] is compatible, and [3,5] conflicts with the selected finish time 4.'],
          ['[0,3] and [3,5].', 'This also hosts two intervals, but it is not the stated algorithm: earliest finish chooses [1,2] before [0,3].'],
          ['[1,2], [2,4], and [3,5].', 'The last two overlap from time 3 to 4. Allowing touching endpoints does not allow overlapping interiors.'],
        ],
        0,
      ),
      explain: q(
        'The one-room objective changes to maximum total value. Intervals [0,2] and [2,4] each have value 2; [0,4] has value 9. Endpoints may touch. Does the earliest-finish rule for maximizing interval count still guarantee an optimal answer?',
        [
          ['Yes; the two short intervals are optimal because two bookings beat one.', 'That optimizes count, not value. The two short bookings earn 4, less than the single long booking worth 9.'],
          ['No; selecting [0,4] earns 9 instead of 4, so weights require a different optimization argument.', 'The count-maximizing exchange argument does not preserve total value. Weighted interval scheduling can compare taking a job with the best compatible total against skipping it.'],
          ['Yes; select all three for total value 13 because endpoints may touch.', 'The long interval overlaps the interiors of both short intervals. Only the two short ones are mutually compatible.'],
        ],
        1,
      ),
    },
    {
      predict: q(
        'KMP searches for pattern "ABABAC", whose longest-proper-prefix/suffix array is [0,0,1,2,3,0]. It has matched "ABABA" (j = 5), but the current text character is B rather than the expected C. What is the first fallback?',
        [
          ['Set j = 0 and advance the text position.', 'The matched suffix ABA is also a pattern prefix, so discarding it wastes a valid partial match. Advancing the text also skips the B that must be compared again.'],
          ['Keep j = 5 and advance the text position.', 'That assumes the mismatching B matched C. The pattern state must fall back before consuming this character.'],
          ['Set j = 3 and compare the same text B again.', 'Use the prefix array at j - 1: lps[4] = 3. The retained ABA can extend with this B at pattern index 3, without rewinding or skipping text.'],
        ],
        2,
      ),
      explain: q(
        'KMP must now report overlapping matches. Pattern "ABA" has prefix array [0,0,1], and text is "ABABA". After reporting the match starting at index 0, what lets the scan also report the match starting at index 2?',
        [
          ['Keep j = lps[2] = 1 and continue with the next text character.', 'The final A of the first match is already the initial A of a possible next match. Retaining it allows the following B and A to complete the overlapping occurrence.'],
          ['Reset j = 0 and continue after the first match.', 'That forgets the A at index 2. The remaining text BA alone cannot rebuild the second full match.'],
          ['Skip ahead by the full pattern length after every match.', 'Full-length skipping assumes matches cannot overlap. It jumps over the valid start at index 2.'],
        ],
        0,
      ),
    },
  ],
  hld: [
    {
      predict: q(
        'Two web servers sit behind a round-robin load balancer. Login on server A stores the session only in A memory and returns a session-ID cookie. The next request goes to B, which has no shared session store. What happens when B validates that session ID?',
        [
          ['B finds the session because the cookie contains all of A memory.', 'An opaque session-ID cookie is just a lookup key. It does not carry the server-side session record.'],
          ['B cannot find the session, so the request can appear unauthenticated.', 'Load balancing distributes requests, not application memory. Shared session storage, a suitable token design, or explicit affinity is needed to address this state dependency.'],
          ['DNS copies the session to B before forwarding the request.', 'DNS resolves names to addresses. It does not replicate application sessions between backends.'],
        ],
        1,
      ),
      explain: q(
        'One hostname on port 443 must route /images to one backend pool and /api to another. The current L4 balancer forwards opaque TLS traffic without decrypting it. What change enables routing by HTTP path?',
        [
          ['Terminate TLS at a trusted HTTP-aware L7 component and route using the decrypted path.', 'The path is inside encrypted HTTP traffic. A trusted component must access the HTTP request to make this routing decision.'],
          ['Inspect the TCP destination port to distinguish /images from /api.', 'Both requests use port 443 on the same hostname. Transport-layer port information does not reveal their different HTTP paths.'],
          ['Add more servers behind the unchanged L4 balancer.', 'More capacity does not expose encrypted application-layer fields. The routing information is still unavailable to that balancer.'],
        ],
        0,
      ),
    },
    {
      predict: q(
        'A stable service completes 200 requests per second, with mean end-to-end time 0.25 seconds per request. There is no growing backlog. Approximately how many requests are in flight on average?',
        [
          ['800.', 'Dividing throughput by latency has the wrong units for concurrency. In-flight work is arrival rate multiplied by time spent in the system.'],
          ['200.', 'Requests per second is a rate, not the number present at once. Each request occupies the system for only a quarter second on average.'],
          ['50.', 'By Little\'s law, average in-flight work is 200 requests/second times 0.25 seconds, or 50 requests. The stable-workload condition matters.'],
        ],
        2,
      ),
      explain: q(
        'A service averages 100 requests/second. Each worker handles one request at a time in 0.1 seconds, and there are 20 workers. A sustained launch spike raises arrivals to 2,000 requests/second with the same processing time. Why does sizing from the daily average fail?',
        [
          ['Twenty workers remain sufficient because the daily average has not changed.', 'Those workers can finish only about 200 requests/second. A sustained 2,000-per-second arrival rate grows the queue despite the lower daily average.'],
          ['The spike needs about 200 busy workers just to match arrivals, before headroom.', 'At 0.1 seconds per request, 2,000 requests/second implies about 200 concurrent requests. Twenty workers provide only one-tenth of that processing capacity.'],
          ['Every request/second always requires its own worker, so exactly 2,000 workers are necessary.', 'A worker finishes about ten requests per second here. Concurrency depends on service time as well as request rate; equating the two overstates the baseline requirement.'],
        ],
        1,
      ),
    },
    {
      predict: q(
        'A payment API durably records an idempotency key, request payload, and completed result atomically with its charge. Keys are scoped to merchant plus operation and retained for 24 hours. The response is lost; the same merchant retries the same operation, key, and payload one minute later. What should happen?',
        [
          ['Return the recorded result; there is still one logical charge.', 'The retry matches the stored request within its scope and retention window. The completed record resolves the uncertain response without executing another charge.'],
          ['Create a second charge because the request uses POST.', 'The HTTP method alone does not determine application deduplication. This API explicitly implements retry-safe behavior using a durable key record.'],
          ['There are no charges because a lost response rolls back the payment.', 'A response can be lost after the charge commits. Client uncertainty does not undo a completed server-side operation.'],
        ],
        0,
      ),
      explain: q(
        'An API scopes idempotency keys to merchant plus operation and retains them for 24 hours. Merchant A used key K for a charge. Merchant B now sends its first charge using the string K. Should B receive the result recorded for A?',
        [
          ['Yes; equal key strings identify one payment across all merchants.', 'The contract includes the merchant in the deduplication identity. Global string-only deduplication would incorrectly merge independent operations and could expose another tenant result.'],
          ['Reject B forever because K has appeared anywhere before.', 'The API promises neither a global key namespace nor permanent retention. Rejecting independent scoped keys invents a different contract.'],
          ['No; B has a distinct scoped operation and must be handled independently.', 'Deduplication applies to the full scope, not just the key text. Even retries within one scope also depend on the documented retention window and payload rules.'],
        ],
        2,
      ),
    },
    {
      predict: q(
        'A unique-email B-tree index currently has three levels, including its root and leaves. A point lookup follows one root-to-leaf path. With no cached pages, and excluding any separate data-row fetch, how many index pages does this lookup visit?',
        [
          ['One, because every index provides constant-time lookup.', 'A B-tree follows its search path through multiple levels. Its height generally grows logarithmically with the number of indexed entries, not as a guaranteed constant.'],
          ['Three, one at each level.', 'This specific tree has three levels, so one search path visits three index pages. Larger trees can gain levels; the number is not a universal constant.'],
          ['Every leaf page, because finding a unique value requires a full scan.', 'The ordered keys direct the lookup to one child per level. A suitable point lookup does not need to scan every leaf.'],
        ],
        1,
      ),
      explain: q(
        'A table used to have one index. Five more indexes are added, all containing fields supplied by each new row. Reads improve, but bulk inserts slow down. What explains the changed write cost?',
        [
          ['Each inserted row must maintain six index structures as well as the table.', 'The extra search structures consume storage, modify pages, and add logging or other maintenance work. Faster selected reads are bought with write amplification.'],
          ['Indexes remove the need to write the underlying table, so inserts must be faster.', 'Indexes supplement the table rather than eliminate its data. Maintaining more copies or key structures adds work to each relevant insert.'],
          ['The insert must execute all possible read queries to populate the indexes.', 'An index is maintained from the row values and index definition. It does not run every future query; its structural maintenance is the extra work.'],
        ],
        0,
      ),
    },
    {
      predict: q(
        'A cache-aside entry stores value A until time 60 seconds. At time 10, the database changes to B without cache invalidation. Reads occur at times 20 and 61; a miss loads the current database value. With no other writes or evictions, what do the reads return?',
        [
          ['B, then B.', 'Updating the database does not automatically update this cache-aside entry. The still-valid cached A serves the first read.'],
          ['A, then A.', 'At time 61 the entry has expired. The miss reloads B from the database rather than retaining A forever.'],
          ['A, then B.', 'The first hit can be stale until expiry. The later miss consults the source of truth and fills the cache with B.'],
        ],
        2,
      ),
      explain: q(
        'On one application instance, 1,000 requests simultaneously miss the same expired hot key while its database fetch is still running. Which change directly prevents those requests from initiating 1,000 duplicate fetches?',
        [
          ['Use a longer TTL for the next cached value, without coordinating current misses.', 'That can delay a future expiry but does not combine the misses already racing before the new entry exists.'],
          ['Coalesce same-key misses so one fetch runs and the other requests await its result.', 'A shared in-flight fetch for this key collapses concurrent duplicate work. Its coordination scope must cover the callers you intend to combine.'],
          ['Flush unrelated cache entries so all callers see an empty cache.', 'Flushing creates more misses and additional database pressure. It does not coordinate requests for the hot key.'],
        ],
        1,
      ),
    },
    {
      predict: q(
        'A leader acknowledges a profile write from version 1 to version 2 before asynchronously replicating it. A follower still has version 1, and the next read is routed there without any freshness check. What can the user read?',
        [
          ['Version 1, despite the successful write acknowledgement.', 'The acknowledgement confirms the leader write under this policy, not immediate follower catch-up. Routing to a lagging replica can violate read-your-write expectations.'],
          ['Only version 2, because all acknowledgements imply synchronous replication.', 'This setup explicitly acknowledges before follower replication. A stronger freshness guarantee requires a different replication or read-routing contract.'],
          ['No value; a lagging follower must always reject reads.', 'A system may deliberately allow stale follower reads. Replica lag alone does not force rejection under the stated policy.'],
        ],
        0,
      ),
      explain: q(
        'Two replica groups cannot communicate during an indefinite network partition. Clients on both sides may read and write the same register. Can the system guarantee linearizability and also successfully complete every valid operation on both sides without waiting for the partition to heal?',
        [
          ['Yes; local timestamps let both sides know about every conflicting write immediately.', 'A timestamp does not deliver an unreachable write or establish which remote operations completed before a local read. Local clocks cannot remove the missing communication.'],
          ['Yes; returning errors for every request preserves CAP availability.', 'An error is not successful completion of the requested register operation. Rejecting requests can preserve consistency, but it gives up the relevant availability guarantee.'],
          ['No; preserving linearizability may require rejecting or waiting on operations on at least one side.', 'CAP constrains behavior during the partition: both sides cannot promise successful independent operations and one linearizable register. It is not a permanent rule to choose only two properties during healthy operation.'],
        ],
        2,
      ),
    },
    {
      predict: q(
        'A consistent-hash ring assigns each key to the first node clockwise at or after its hash. Nodes are at 20, 60, and 90; key hashes are 10, 35, and 70. After adding a node at 40, which of these keys changes owner?',
        [
          ['All three keys.', 'Only the arc newly owned by node 40 changes. The clockwise successors for hashes 10 and 70 remain nodes 20 and 90.'],
          ['Only key 70, from node 90 to node 40.', 'Starting at 70, node 90 is still encountered first. Node 40 is not its clockwise successor.'],
          ['Only key 35, from node 60 to node 40.', 'The added node takes the segment after 20 through 40. Key 35 lies in that segment; the other two keys keep their previous successors.'],
        ],
        2,
      ),
      explain: q(
        'Keys are evenly distributed across shards, but one read-only key receives 90% of requests. The owner of each key serves all its reads. Why will adding virtual nodes alone not necessarily remove this hotspot?',
        [
          ['That one key still has one serving owner; spreading its reads requires an explicit caching or replication-and-routing strategy.', 'Virtual nodes can improve distribution of key ranges, but they do not automatically divide requests for one indivisible key among servers.'],
          ['Virtual nodes automatically split every individual key value and its reads across all machines.', 'They assign additional ranges to nodes. Splitting a value or serving replicas needs a separate data model and routing policy.'],
          ['Once hashes are balanced, request load is necessarily balanced too.', 'Equal key counts do not imply equal popularity. One very hot key can dominate traffic on its otherwise evenly populated shard.'],
        ],
        0,
      ),
    },
    {
      predict: q(
        'An initially empty queue receives 80 messages per second and successfully removes 50 messages per second. Rates are constant, with no duplicates or failures. How many messages are waiting after 10 seconds?',
        [
          ['800.', 'That counts every produced message but ignores the 500 messages consumers removed during those ten seconds.'],
          ['300.', 'The backlog grows at 80 - 50 = 30 messages per second, so ten seconds adds 300 waiting messages.'],
          ['30.', '30 is the growth rate per second. The accumulated backlog after ten seconds is ten times that amount.'],
        ],
        1,
      ),
      explain: q(
        'An order commits to a database, but the process crashes before publishing its notification event. How can the design prevent losing that committed notification intent without claiming arbitrary external side effects happen exactly once?',
        [
          ['Publish first, then commit the order in an unrelated transaction.', 'A crash or database failure between those steps can send a notification for an order that never commits. Reordering does not make the two actions atomic.'],
          ['Choose an exactly-once broker and keep the existing database-then-publish sequence.', 'A broker cannot deliver an event it never received. The crash gap occurs before broker delivery guarantees apply.'],
          ['Write an outbox record in the order transaction, relay it later, and make side-effect handling retry-safe.', 'The transaction records the order and publication intent together. The relay can resend after failures, so downstream deduplication or idempotency still needs an explicit scope.'],
        ],
        2,
      ),
    },
    {
      predict: q(
        'Five Raft voters split into connected groups of three and two. The old leader is in the group of two. The group of three elects an eligible new leader and replicates a current-term entry to all three members. Which group can commit new writes?',
        [
          ['Only the group of three.', 'A majority of the configured five voters is three. The new leader has that quorum; the old leader cannot commit new entries using only its two reachable voters.'],
          ['Both groups, because each can form a majority of its reachable members.', 'Quorum is measured against the configured voting membership, not a locally redefined group. Local majorities on both sides would permit conflicting commits.'],
          ['Only the group of two, because it contains the original leader.', 'A leader title does not replace majority replication. The isolated old leader must not acknowledge newly committed writes without a quorum.'],
        ],
        0,
      ),
      explain: q(
        'A Raft cluster safely completes a membership change from five voters to six. Later, three voters fail and the other three can communicate. Compared with a five-voter cluster with three survivors, why does adding this sixth voter not help new-write availability?',
        [
          ['Three is enough because half the voters is a majority.', 'A majority must be strictly more than half. In a six-voter configuration, three votes are insufficient.'],
          ['Six voters require four for a majority, so three survivors cannot commit; both sizes tolerate only two failures.', 'Five voters need three and six need four. An extra even-numbered voter can increase quorum size without increasing the number of failures tolerated.'],
          ['The old quorum of three applies forever after membership changes.', 'After the safe transition completes, decisions use the new stable membership. Keeping an obsolete quorum rule would undermine the configured consensus guarantees.'],
        ],
        1,
      ),
    },
    {
      predict: q(
        'One hundred independent client requests reach a failing dependency. Each client makes one initial attempt and exactly two retries; every attempt reaches the dependency. How many dependency attempts occur?',
        [
          ['100.', 'That counts only initial attempts. Retrying creates additional load even though there are still only 100 original user requests.'],
          ['200.', 'Two retries are in addition to the initial attempt, not the total attempt count. Each client sends three attempts.'],
          ['300.', 'Each of 100 requests produces 1 + 2 = 3 attempts. Retry amplification can worsen the overload that caused the failures.'],
        ],
        2,
      ),
      explain: q(
        'Checkout has a one-second response deadline. An optional recommendation call now takes five seconds during failures, while payment is healthy. Which change best keeps useful checkout work from waiting for that optional dependency?',
        [
          ['Give recommendations a small bounded time budget and isolated resources, then fall back when unavailable.', 'Checkout can still complete without recommendations. A bounded call, appropriate cancellation or resource limits, and fallback prevent optional work from consuming the critical path indefinitely.'],
          ['Raise the checkout deadline to ten seconds for every user.', 'That accommodates the slow optional call by making the critical flow wait longer. It also retains resources longer and can spread the overload.'],
          ['Immediately retry recommendations three times within every checkout.', 'Additional immediate calls amplify traffic to the degraded service. They do not establish a bounded, independent path for the essential payment work.'],
        ],
        0,
      ),
    },
    {
      predict: q(
        'A service loses its primary at 10:27. Its latest restorable backup is from 10:20, with no newer log available, and it resumes service at 10:42. All writes after the backup are lost. What are the observed data-loss window and outage duration?',
        [
          ['10 minutes of data loss and 15 minutes of outage.', 'The backup schedule does not determine this observed loss. The actual gap is from 10:20 to 10:27, or seven minutes.'],
          ['7 minutes of data loss and 15 minutes of outage.', 'Data loss spans the last recoverable point to failure; the outage spans failure to recovery. These observations can be compared with the stated RPO and RTO targets.'],
          ['7 minutes of data loss and 22 minutes of outage.', 'The backup timestamp is not the start of the outage. Service was available until 10:27, so recovery at 10:42 ends a fifteen-minute outage.'],
        ],
        1,
      ),
      explain: q(
        'An accidental deletion is successfully replicated to every healthy replica. The service must recover the deleted records. Which preparation addresses this failure mode?',
        [
          ['Promote any replica; healthy replication guarantees it still has the deleted records.', 'Healthy replication copied the deletion too. A promoted replica with the same state does not recover data that was removed everywhere.'],
          ['Wait for replicas to converge before attempting recovery.', 'They have already converged on the unwanted deletion. Convergence preserves agreement, not historical versions by itself.'],
          ['Keep isolated, versioned recovery data and regularly test restoration to a point before the deletion.', 'A recoverable historical copy addresses logical data loss that replication propagates. Restore tests establish whether the backup and procedure actually meet recovery needs.'],
        ],
        2,
      ),
    },
    {
      predict: q(
        'A URL shortener serves 10,000 redirects per second. Its cache hit rate is exactly 98%; each miss causes one database read and each hit causes none. There is no other database traffic. The database sustains 150 reads per second. What is the resulting pressure?',
        [
          ['200 database reads per second, exceeding capacity by 50.', 'The remaining 2% of 10,000 is 200. A high hit rate can still leave more misses than the source of truth can handle.'],
          ['100 database reads per second, safely below capacity.', 'A 98% hit rate leaves 2% misses, not 1%. That percentage difference doubles the proposed database traffic.'],
          ['10,000 database reads per second, because caches do not reduce source reads.', 'The stated cache hits avoid database access. Only the misses contribute to this database-read estimate.'],
        ],
        0,
      ),
      explain: q(
        'A shortener previously allowed URL metadata to be stale for ten minutes. It now must stop redirecting a revoked abusive URL within one second. Why is keeping the existing ten-minute cache policy insufficient, and what new boundary is needed?',
        [
          ['Keep the cache policy and add database read replicas; revocations will bypass existing hits automatically.', 'A hit does not contact those replicas. More database capacity alone cannot change the stale decision already stored in the cache.'],
          ['Check bounded-freshness revocation state even for cache hits, and fail closed if the one-second freshness bound cannot be established.', 'The new safety requirement applies to served redirects, not just database updates. The bound must include propagation and source freshness, trading some cost or availability for enforced revocation.'],
          ['Extend the TTL so fewer requests reach the revocation data store.', 'A longer stale window moves in the opposite direction from the new requirement. Lower source load does not justify serving a revoked link.'],
        ],
        1,
      ),
    },
  ],
  lld: [
    {
      predict: q(
        'Checkout receives separate PaymentGateway and ReceiptSender interfaces. A new email vendor preserves the ReceiptSender contract; pricing and payment behavior stay unchanged. Which production code should normally need modification?',
        [
          ['Every pricing method, because email delivery is part of checkout.', 'Pricing does not depend on the vendor contract in this design. Editing it expands the change beyond the responsibility that actually varies.'],
          ['Checkout must learn the new vendor API directly.', 'That would bypass the existing ReceiptSender boundary and recouple orchestration to vendor details the interface was meant to hide.'],
          ['The receipt-sending implementation and its construction or wiring.', 'The stable interface lets checkout keep orchestrating the same operation while the implementation at the changing external boundary is replaced.'],
        ],
        2,
      ),
      explain: q(
        'PaymentGateway.charge promises an approved-or-declined result for any nonnegative amount. A replacement provider requires a minimum charge of 10 and throws for an amount of 5. How can its adapter preserve what existing checkout callers were promised?',
        [
          ['Require every caller to detect the concrete provider before charging 5.', 'That transfers the provider-specific restriction into callers and abandons substitutability through the promised interface.'],
          ['Translate the provider minimum rejection into a declined result for 5.', 'The base contract already allows a decline. Returning that result preserves the accepted input range and failure representation without pretending the provider approved the charge.'],
          ['Keep throwing because implementing the same method name guarantees compatibility.', 'Matching a method signature does not preserve behavioral promises. The changed precondition and error behavior break callers that rely on a result for 5.'],
        ],
        1,
      ),
    },
    {
      predict: q(
        'Money is an immutable value object whose equality compares amount and currency. Two separately constructed objects both represent 1,000 USD cents. A third represents 1,000 EUR cents. Which comparison is correct?',
        [
          ['The two USD objects are equal in value; the EUR object is not equal to them.', 'A value object is compared by its defined components, not allocation identity. Currency is part of this value, so the same numeric amount in EUR differs.'],
          ['All three are equal because their numeric amounts match.', 'Ignoring currency loses a component of Money equality and would treat different units as interchangeable.'],
          ['None are equal because each object was allocated separately.', 'That describes reference identity, not the stated value-equality contract. Separate immutable objects can represent the same value.'],
        ],
        0,
      ),
      explain: q(
        'Parking spots already enforce a size rule. Requirements now add charging capability and accessibility authorization, varying independently of size. Which change supports combinations while keeping allocation checks inside the model?',
        [
          ['Let callers set occupied = true directly and remember all checks themselves.', 'Public mutation lets one caller bypass size, charging, or authorization requirements. The spot invariant no longer has an enforcing boundary.'],
          ['Make charging imply accessibility permission so one flag covers both.', 'These requirements vary independently. Combining them would authorize or reject vehicles for the wrong reason.'],
          ['Compose the spot with separate eligibility rules, and require all applicable rules to pass before allocation.', 'Independent rules can combine without a subclass for every permutation. Keeping the allocation operation in control prevents callers from bypassing the combined invariant.'],
        ],
        2,
      ),
    },
    {
      predict: q(
        'A vending machine has one item priced at 3 and credit 0. Inserting 2 makes credit 2. Its buy operation dispenses only when stock is positive and credit is at least the price; otherwise it changes nothing. What follows a buy attempt now?',
        [
          ['One item is dispensed and credit becomes -1.', 'That subtracts the price without satisfying the sufficient-credit guard. The stated operation must reject instead.'],
          ['No item is dispensed; stock remains 1 and credit remains 2.', 'Stock is sufficient, but credit is not. Because a failed buy changes nothing, both the inventory and inserted credit remain intact.'],
          ['No item is dispensed and credit resets to 0.', 'Rejecting the purchase is not a cancellation or refund. Resetting credit would silently lose the inserted money under this contract.'],
        ],
        1,
      ),
      explain: q(
        'A vending machine holds credit 5 for a product priced at 3, but the product becomes unavailable before buy. Failed buys leave credit unchanged; cancel refunds all remaining credit. After buy is rejected and cancel runs, what should a sequence test assert?',
        [
          ['Refund 5, remaining credit 0, stock 0, and no dispensed item.', 'The rejected purchase must not consume money. Testing the subsequent cancellation exposes whether an illegal charge or lost-credit transition occurred.'],
          ['Refund 2, because attempting to buy consumes the price even without an item.', 'The failed-buy contract explicitly preserves credit. Retaining 3 would charge for a purchase that never happened.'],
          ['Refund 0, because a failed buy should clear the credit before cancellation.', 'Clearing credit without returning it violates both the failed-buy behavior and the cancellation promise. The sequence would hide lost customer money.'],
        ],
        0,
      ),
    },
    {
      predict: q(
        'Legacy code computes a fee as floor(subtotal * 0.075), returning 14 for subtotal 199. During an extract-function refactoring, the helper instead rounds to the nearest integer and returns 15. Is this a behavior-preserving refactoring?',
        [
          ['Yes; both implementations apply a 7.5% rate.', 'The shared rate does not make their observable results equal. Rounding policy is part of the behavior clients see.'],
          ['Yes, if the new helper has a passing test expecting 15.', 'A test that only asserts the new behavior does not establish preservation of the old one. The legacy input-output pair is a counterexample.'],
          ['No; the fee changes by 1 for this input.', 'A characterization case distinguishes the implementations immediately. Preserve the original calculation when extracting, then make any intentional policy change separately.'],
        ],
        2,
      ),
      explain: q(
        'Shipping fees and late-payment fees both used to be a constant 5. Shipping now must vary by distance, while late-payment fees must remain 5. Why should similar old expressions not automatically become one shared fee policy?',
        [
          ['They should share the distance-based function, so late fees change whenever shipping changes.', 'That directly violates the new requirement that late fees remain 5. Similar old numbers did not establish a shared business rule.'],
          ['Their change drivers differ; separate named policies preserve the required independent behavior.', 'This is coincidental similarity rather than duplicated domain knowledge. Separating the policies lets shipping evolve without changing late-payment charges.'],
          ['The late-payment policy should inherit shipping behavior without overriding its calculation.', 'That still makes late fees follow distance-based shipping. Inheritance does not make unrelated change drivers become the same responsibility.'],
        ],
        1,
      ),
    },
    {
      predict: q(
        'An OrderService uses only the MailSender passed into its constructor. A test passes a recording fake, and completeOrder invokes that sender once. No real sender is constructed. What should the test observe?',
        [
          ['The fake records one send, with no real email delivery.', 'Constructor injection makes the dependency explicit. Since the service uses the supplied fake and no real sender exists, the test exercises orchestration without the external side effect.'],
          ['A real email is delivered because constructor injection creates production dependencies automatically.', 'Injection supplies a chosen object; it does not secretly replace that object with a production implementation.'],
          ['Both fake and real senders run because they implement the same interface.', 'Sharing an interface does not broadcast method calls. Only the particular injected instance receives this call.'],
        ],
        0,
      ),
      explain: q(
        'A new notification provider requires a provider-specific client and matching credential type. Provider A credentials cannot authenticate provider B clients. How should construction change while keeping send-notification business logic provider-independent?',
        [
          ['Pick the client and credential independently, allowing any A/B combination.', 'Independent selection admits incompatible object graphs. The error is avoidable at construction, before any business operation tries to send.'],
          ['Have every business method inspect global provider settings and rebuild its own client and credentials.', 'That spreads construction policy across business logic and can assemble inconsistent dependencies when settings differ or change. It does not keep the business layer provider-independent.'],
          ['Assemble and validate a matching client-credential pair from one provider configuration at the construction boundary.', 'Coordinated construction prevents incompatible families from becoming usable dependencies. A factory or composition root can contain that variation while the service keeps a stable contract.'],
        ],
        2,
      ),
    },
    {
      predict: q(
        'A document starts Draft. submit moves it to Review; approve moves Review to Published. edit is permitted only in Draft and otherwise rejects without changes. After submit, approve, then edit, what is its state?',
        [
          ['Draft, because editing automatically reopens a document.', 'No reopen transition was specified. The edit guard rejects outside Draft rather than inventing a state change.'],
          ['Published, with the edit rejected.', 'The first two operations reach Published. The final operation fails its Draft-only guard, leaving both state and content unchanged.'],
          ['Review, because rejection reverses the last successful transition.', 'A rejected edit changes nothing. It does not undo the earlier approve operation.'],
        ],
        1,
      ),
      explain: q(
        'A parking ticket has Open and Paid lifecycle states. New weekday and weekend pricing algorithms may be selected independently, including for price previews, but changing a pricing policy must never reopen a paid ticket. How should these variations interact?',
        [
          ['Select a pricing policy separately while preserving the ticket lifecycle and its payment guards.', 'Pricing chooses how an amount is calculated; lifecycle state controls which operations are legal. Independent policy selection avoids changing payment status merely to preview another price.'],
          ['Reset the ticket to Open whenever the pricing algorithm changes.', 'That turns a calculation choice into an illegal lifecycle reversal and can make an already-paid ticket appear unpaid.'],
          ['Permit a different pricing algorithm only by changing Paid back to Open.', 'The new requirement allows independent pricing variation. Coupling it to reopening both blocks valid previews and violates the paid-state invariant.'],
        ],
        0,
      ),
    },
    {
      predict: q(
        'A read passes through Authorization(Cache(Store)). Authorization checks permission before delegating and rejects unauthorized callers immediately. The cache has the requested secret, but the caller lacks permission. What happens?',
        [
          ['The cached secret is returned because cache hits skip every wrapper.', 'The authorization layer is outside the cache and runs before the cache is called. A hit cannot bypass a check that already rejected the request.'],
          ['The store is read, then access is denied.', 'Authorization rejects before delegation, so neither the cache nor the store needs to process this request.'],
          ['Access is denied without returning cached data or reading the store.', 'Wrapper order matters: the access check guards both hits and misses. Putting an unchecked shared cache outside authorization could change that behavior.'],
        ],
        2,
      ),
      explain: q(
        'The application payment port accepts integer USD cents. A new vendor expects a decimal USD string. For a charge of 1,250 cents, which adapter behavior preserves the existing application contract?',
        [
          ['Send the string "1250" to the vendor.', 'That represents 1,250 dollars, not cents, and overcharges by a factor of 100. Changing representation requires unit conversion, not only string conversion.'],
          ['Convert at the vendor boundary and send "12.50".', 'The adapter translates both representation and units while application code continues using its existing integer-cent contract.'],
          ['Divide by 100, discard the fractional part, and send "12".', 'Discarding the fractional part loses 50 cents. The boundary must preserve the exact monetary value, including its fractional currency units.'],
        ],
        1,
      ),
    },
    {
      predict: q(
        'An event publisher invokes subscribers A then B synchronously in a simple loop with no exception handling. Subscriber A throws immediately. What does the call to publish observe?',
        [
          ['The exception propagates and B is not called.', 'Both callbacks run in the publisher call stack. Without a catch around A, execution exits before the loop reaches B.'],
          ['publish returns successfully while A and B continue on background threads.', 'An observer interface does not create asynchronous execution. The stated publisher invokes callbacks synchronously.'],
          ['The exception is silently discarded and B always runs.', 'That would require an explicit error-isolation policy. No handler exists here to swallow the exception or continue delivery.'],
        ],
        0,
      ),
      explain: q(
        'A queued receipt command stores a reference to a mutable order whose total is 10. Before the command executes, the order total changes to 20. The receipt must reflect the total at submission time. What should the command capture?',
        [
          ['A closure that reads order.total when the command eventually runs.', 'The closure still dereferences the mutable order at execution time, so it observes 20 rather than the required submitted value 10.'],
          ['Only a reference to the live order, because queuing freezes referenced objects.', 'A queue retains a reference or serialized payload according to its design. Merely storing a live reference does not freeze the object it points to.'],
          ['An immutable snapshot of the required receipt fields, including the submitted total 10.', 'Capturing the intended values at submission separates the command meaning from later mutations. It preserves which receipt was requested, rather than recomputing it from current state.'],
        ],
        2,
      ),
    },
    {
      predict: q(
        'Two reservation requests read the same available seat at version 7. Each then attempts an atomic update that reserves it only if its version is still 7, and increments the version. A succeeds before B attempts its update. What should happen?',
        [
          ['Both reservations succeed because both initial reads saw availability.', 'The version condition is checked atomically at write time, not only at read time. B cannot commit using the stale version after A changes it.'],
          ['A succeeds; B updates zero rows and must handle a conflict without confirming the seat.', 'A advances the version to 8. B expected 7, so optimistic locking rejects its stale write and the application must not report a second successful reservation.'],
          ['Neither reservation can succeed because concurrent reads invalidate both requests.', 'Concurrent reads do not themselves change the version. The first valid conditional write can succeed; only the stale competing write is rejected.'],
        ],
        1,
      ),
      explain: q(
        'Accounts A and B are in the same transactional database. A transfer of 10 must make the debit and credit visible atomically, or neither may happen. With separate repository saves, A goes from 100 to 90, then saving B from 0 to 10 fails. What boundary is missing?',
        [
          ['One database transaction covering both balance changes, with rollback if either fails.', 'Repository interfaces isolate access, but do not automatically combine separate saves. A shared transaction protects this cross-account all-or-nothing invariant.'],
          ['Two repository classes instead of one; class separation automatically rolls back earlier saves.', 'Object boundaries do not establish a database transaction. A successfully committed debit remains committed unless the persistence protocol provides atomicity or explicit recovery.'],
          ['Retry the whole transfer by subtracting another 10 from the current A balance.', 'An uncoordinated retry can debit A twice. It neither repairs the original atomicity gap nor establishes whether earlier work already took effect.'],
        ],
        0,
      ),
    },
    {
      predict: q(
        'A thread-safe map starts empty. Two threads implement create-if-absent as separate containsKey and put calls: A checks absent, B checks absent, A puts value A, then B puts value B. Both return "created" after their own put. What is the outcome?',
        [
          ['Only A can return "created", because each map method is thread-safe.', 'Individual method safety does not make the check-and-put pair atomic. Both checks occurred before either insertion, so both callers follow their creation branch.'],
          ['The map holds two values under the same key.', 'A normal map has one value per key. The later put replaces the earlier value rather than storing two entries with the same key.'],
          ['Both return "created", and the final stored value is B.', 'The specified interleaving lets both pass the check, and B writes last. An atomic put-if-absent or a lock around the complete invariant is needed.'],
        ],
        2,
      ),
      explain: q(
        'Transfers lock two accounts. One thread transferring A to B locks A then waits for B; another transferring B to A locks B then waits for A. How should lock acquisition change to prevent this two-lock deadlock?',
        [
          ['Always lock the destination before the source instead.', 'Opposite-direction transfers still acquire the two locks in opposite orders. Reversing each local rule preserves the possibility of a cycle.'],
          ['Every transfer locks the lower account ID first, then the higher ID, regardless of transfer direction.', 'A shared global order prevents one thread holding the higher lock while waiting for the lower one in this protocol, removing the circular wait.'],
          ['Make both locks reentrant and keep the current acquisition order.', 'Reentrancy lets one thread reacquire a lock it already owns. It does not let that thread acquire a lock held by another thread, so this cycle remains possible.'],
        ],
        1,
      ),
    },
    {
      predict: q(
        'An expense of 1,000 USD cents is split equally among users A, B, and C. Shares must be whole cents, sum exactly to 1,000, and assign leftover cents in ascending user-ID order. What shares result?',
        [
          ['A: 334, B: 333, C: 333 cents.', 'The base share is 333 cents each, leaving one cent. The stated deterministic remainder rule assigns it to A and preserves the exact total.'],
          ['A: 333, B: 333, C: 333 cents.', 'Those shares sum to 999 cents. Truncating every share without distributing the remainder violates the total-preservation invariant.'],
          ['A: 334, B: 334, C: 334 cents.', 'Rounding every share up produces 1,002 cents. Only the one leftover cent may be distributed.'],
        ],
        0,
      ),
      explain: q(
        'An expense-sharing app now supports multiple currencies but has no foreign-exchange conversion feature. A owes B 10 USD, and B owes A 10 EUR. Can settlement simplification declare both obligations cleared because the numbers match?',
        [
          ['Yes; opposite directions with equal numeric amounts always cancel.', 'USD and EUR are different units. Equal numbers do not establish equal economic value or authorize a currency conversion.'],
          ['Yes; silently relabel both obligations using the first debt currency.', 'Relabeling changes what someone owes without a conversion agreement. It loses information rather than satisfying either original obligation.'],
          ['No; preserve separate currency balances unless an explicit conversion contract is introduced.', 'Netting is valid within a shared unit. Cross-currency settlement requires deliberate rates, rounding, and acceptance rules that this product does not yet define.'],
        ],
        2,
      ),
    },
    {
      predict: q(
        'During a rolling deployment, old and new booking servers share a database. Old servers accept only Held and Confirmed states and throw on unknown states. A new server writes RefundPending. What happens when an old server next reads that row?',
        [
          ['It automatically understands RefundPending because the database accepted it.', 'Database storage compatibility does not update an old application validator. Its known state set remains unchanged.'],
          ['That read fails at the old validator even if the new server handles the row correctly.', 'Mixed-version deployments must account for both readers and writers. Emitting a new state before all relevant readers tolerate it breaks backward compatibility.'],
          ['It safely treats the row as Confirmed without any code change.', 'No such fallback exists in the stated old code. Inventing one would also risk silently misrepresenting a refund lifecycle.'],
        ],
        1,
      ),
      explain: q(
        'A booking payment times out after the provider may have charged it. The provider supports idempotency keys scoped to a merchant and operation for a documented retention window. What retry design avoids treating an unknown outcome as a definite failure?',
        [
          ['Persist the unresolved operation, reuse its scoped key for the same request within retention, and reconcile before retrying beyond that guarantee.', 'A timeout does not prove the charge failed. Durable operation identity and explicit unknown-state handling support safe recovery within the provider contract instead of claiming unlimited exactly-once behavior.'],
          ['Generate a fresh key on every timeout so the provider will accept the next attempt.', 'A fresh key identifies a different operation and may create another charge while the original one already succeeded. It defeats the retry deduplication guarantee.'],
          ['Mark the payment failed immediately; a local failure state guarantees the provider rolled it back.', 'Local state cannot undo an external completed charge. Recovery must determine or safely reuse the remote outcome before deciding what to retry or compensate.'],
        ],
        0,
      ),
    },
  ],
}

export function getLearningChecks(
  track: 'dsa' | 'hld' | 'lld',
  week: number,
): { predict: LearningCheck; explain: LearningCheck } {
  if (!Number.isInteger(week) || week < 1 || week > 12) {
    throw new RangeError('Learning check week must be an integer from 1 to 12.')
  }

  const lesson = checks[track]?.[week - 1]
  if (!lesson) {
    throw new Error(`No learning checks for track "${track}" and week ${week}.`)
  }

  return lesson
}
