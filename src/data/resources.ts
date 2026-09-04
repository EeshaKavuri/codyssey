export type ResourceGroup = {
  id: 'dsa' | 'hld' | 'lld' | 'ux'
  title: string
  description: string
  resources: {
    name: string
    url: string
    note: string
  }[]
}

export const resourceGroups: ResourceGroup[] = [
  {
    id: 'dsa',
    title: 'DSA curriculum and practice',
    description: 'The question catalog, source platforms, and visual references used to organize algorithm practice.',
    resources: [
      { name: 'Striver A2Z DSA Sheet on Hynts', url: 'https://hynts.in/preparation/dsa-sheets/striver-a2z-dsa-sheet/', note: 'Primary 455-question catalog and exact problem links.' },
      { name: 'Take U Forward', url: 'https://takeuforward.org/', note: 'Concept lessons and problems referenced by the A2Z sheet.' },
      { name: 'LeetCode', url: 'https://leetcode.com/problemset/', note: 'Primary online judge for linked practice questions.' },
      { name: 'InterviewBit', url: 'https://www.interviewbit.com/courses/programming/', note: 'Additional interview problem source.' },
      { name: 'HackerRank', url: 'https://www.hackerrank.com/domains/algorithms', note: 'Language fundamentals and selected exercises.' },
      { name: 'SPOJ', url: 'https://www.spoj.com/problems/classical/', note: 'Competitive-programming problem source.' },
    ],
  },
  {
    id: 'hld',
    title: 'High-level system design',
    description: 'Architecture fundamentals, reliability guidance, distributed-systems models, and production case studies.',
    resources: [
      { name: 'System Design Primer', url: 'https://github.com/donnemartin/system-design-primer', note: 'Interview method and core architecture building blocks.' },
      { name: 'System Design 101', url: 'https://github.com/ByteByteGoHq/system-design-101', note: 'Visual explanations of common distributed-system concepts.' },
      { name: 'Awesome System Design Resources', url: 'https://github.com/ashishps1/awesome-system-design-resources', note: 'Curated references and engineering articles.' },
      { name: 'Google SRE Book', url: 'https://sre.google/sre-book/table-of-contents/', note: 'SLOs, monitoring, overload, cascading failures, and reliability.' },
      { name: 'The Secret Lives of Data: Raft', url: 'http://thesecretlivesofdata.com/raft/', note: 'Interactive intuition for leader election and replicated logs.' },
      { name: 'Raft official site', url: 'https://raft.github.io/', note: 'Raft paper, talks, visualizations, and implementations.' },
      { name: 'Netflix Technology Blog', url: 'https://netflixtechblog.com/', note: 'Caching, resilience, streaming, and large-scale operations.' },
      { name: 'Uber Engineering Blog', url: 'https://www.uber.com/blog/engineering/', note: 'Geospatial systems, storage, reliability, and real-time platforms.' },
    ],
  },
  {
    id: 'lld',
    title: 'Low-level and object design',
    description: 'Object modeling, SOLID, design patterns, concurrency, and classic interview exercises.',
    resources: [
      { name: 'Awesome Low-Level Design', url: 'https://github.com/ashishps1/awesome-low-level-design', note: 'LLD concepts, pattern references, and interview problems.' },
      { name: 'Refactoring.Guru — Design Patterns', url: 'https://refactoring.guru/design-patterns', note: 'Intent, structure, examples, applicability, and trade-offs for GoF patterns.' },
      { name: 'Refactoring.Guru — Refactoring', url: 'https://refactoring.guru/refactoring', note: 'Code smells and behavior-preserving refactoring techniques.' },
    ],
  },
  {
    id: 'ux',
    title: 'Visual and interaction inspiration',
    description: 'References that informed the progressive-disclosure, animation, and simulation style. The app does not copy their visual assets.',
    resources: [
      { name: 'Coddy Linked List Visualizer', url: 'https://coddy.tech/visualize/data-structures/linked-list?view=array&speed=1&size=14', note: 'Operation controls and approachable data-structure visualization.' },
      { name: 'VisuAlgo Linked List', url: 'https://visualgo.net/en/list', note: 'Step controls, algorithm state, and lecture-to-exploration progression.' },
      { name: 'The Secret Lives of Data', url: 'https://thesecretlivesofdata.com/', note: 'Narrative animation for distributed-system behavior.' },
      { name: 'System Design Lab', url: 'https://systemdesignlab.netlify.app/', note: 'Interactive architecture and object-design presentation.' },
      { name: 'PaperDraw', url: 'https://paperdraw.dev/', note: 'Architecture-canvas and system simulation inspiration.' },
    ],
  },
]
