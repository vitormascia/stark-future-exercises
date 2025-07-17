![Node.js](https://img.shields.io/badge/node-24.4.0-green.svg)
![TypeScript](https://img.shields.io/badge/typescript-^5.8.3-blue.svg)
![Jest](https://img.shields.io/badge/jest-^30.0.4-purple.svg)

# STARK FUTURE EXERCISES

- [**Exercise 1 - License Plates**](https://gist.github.com/sikanrong/068953c3b606c4e89f21485b6ce1472c)
- [**Exercise 2 - JavaScript Concurrency**](https://gist.github.com/sikanrong/ca77bf9b60a6462bf0f447abf913e606)

## Exercise 1 - License Plates

You work for the DMV; you have a specific, sequential way of generating new license plate numbers:

Each license plate number has `6` alphanumeric characters. The numbers always come before the letters

- The first plate number is `000000`, followed by `000001`...
- When you arrive at `999999`, the next entry would be `00000A`, Followed by `00001A`...
- When you arrive at `99999A`, the next entry is `00000B`, Followed by `00001B`...
- After following the pattern to `99999Z`, the next in the sequence would be `0000AA`...

- When `9999AA` is reached, the next in the series would be `0000AB`...`0001AB`
- When `9999AB` is reached, the next in the series would be `0000AC`...`0001AC`
- When `9999AZ` is reached, the next in the series would be `0000BA`...`0001BA`
- When `9999ZZ` is reached, the next in the series would be `000AAA`...`001AAA`

- And so on untill the sequence completes with `ZZZZZZ`

So the pattern overview looks a bit like this:

`000000`
`000001`
...

`999999`
`00000A`
`00001A`
...

`99999A`
`00000B`
`00001B`
...

`99999Z`
`0000AA`
`0001AA`
...

`9999AA`
`0000AB`
`0001AB`
...

`9999AB`
`0000AC`
`0001AC`
...

`9999AZ`
`0000BA`
`0001BA`
...

`9999BZ`
`0000CA`
`0001CA`
...

`9999ZZ`
`000AAA`
`001AAA`
...

`999AAA`
`000AAB`
`001AAB`
...

`999AAZ`
`000ABA`
...

`ZZZZZZ`

The goal is to write the most efficient function that can return the `nth` element in this sequence

### 1.1 Anatomy of a License Plate

Each license plate is made of `6` characters:

- Digits (`0–9`) come before letters (`A–Z`)
- Leftmost positions are digits (`0-9`)
- Rightmost positions are letters (`A-Z`)
- Digits (`0-9`) are used from the left until exhausted. Then, letters (`A-Z`) are introduced from the right
- Letters increase slower than digits
- Examples:
  - `000000`, `000001`, `000002`, ..., `999999`
  - Then `00000A`, `00001A`, ..., `99999A`
  - Then `00000B`, ..., `99999Z`
  - Then `0000AA`, `0001AA`, ..., `9999ZZ`
  - Eventually: `000AAA`,`001AAA`, ..., `999ZZZ`
  - Ends at: `ZZZZZZ`

So, the format evolves as we run out of digits:

- Start with `6` digits: `000000` → `999999`
- Then `5` digits + `1` letter: `00000A` → `99999Z`
- Then `4` digits + `2` letters: `0000AA` → `9999ZZ`
- Eventually ends at `6` letters: `ZZZZZZ`

### 1.2 License Plates Format Buckets

- Digits (`0-9`) are represented as `#`
- Letters (`A-Z`) are presented as `@`
- Total of `7` buckets'
- Total of `501.363.136` License Plates (From `0` to `501.363.135`)

| Format   | Number of digits | Number of letters | Number of combinations                              |
| -------- | ---------------- | ----------------- | --------------------------------------------------- |
| `######` | `6`              | `0`               | `10⁶` (`1.000.000`) × `26⁰` (`1`) = `1.000.000`     |
| `#####@` | `5`              | `1`               | `10⁵` (`100.000`) × `26¹` (`26`) = `2.600.000`      |
| `####@@` | `4`              | `2`               | `10⁴` (`10.000`) × `26²` (`676`) = `6.760.000`      |
| `###@@@` | `3`              | `3`               | `10³` (`1.000`) × `26³` (`17.576`) = `17.576.000`   |
| `##@@@@` | `2`              | `4`               | `10²` (`100`) × `26⁴` (`456.976`) = `45.697.600`    |
| `#@@@@@` | `1`              | `5`               | `10¹` (`10`) × `26⁵` (`11.881.376`) = `118.813.760` |
| `@@@@@@` | `0`              | `6`               | `10⁰` (`1`) x `26⁶` (`308.915.776`) = `308.915.776` |
| `∅`      | `∅`              | `∅`               | `501.363.136`                                       |

### 1.3 License Plates Space Buckets

- Digits (`0-9`) are represented as `#`
- Letters (`A-Z`) are presented as `@`

<table>
  <tr>
    <th>Format</th>
    <th>Format Range</th>
    <th>Index Range</th>
    <th>Letter</th>
    <th>Letter Bucket Format Range</th>
    <th>Letter Bucket Index Range</th>
  </tr>
  <tr>
    <td rowspan="5"><code>######</code></td>
    <td rowspan="5"><code>000000</code> - <code>999999</code></td>
    <td rowspan="5"><code>0</code> - <code>999.999</code></td>
    <td><code>∅</code></td>
    <td><code>∅</code></td>
    <td><code>∅</code></td>
  </tr>
  <tr>
    <td><code>∅</code></td>
    <td><code>∅</code></td>
    <td><code>∅</code></td>
  </tr>
  <tr>
    <td><code>∅</code></td>
    <td><code>∅</code></td>
    <td><code>∅</code></td>
  </tr>
  <tr>
    <td>...</td>
    <td>...</td>
    <td>...</td>
  </tr>
  <tr>
    <td><code>∅</code></td>
    <td><code>∅</code></td>
    <td><code>∅</code></td>
  </tr>
  <tr>
    <td rowspan="5"><code>#####@</code></td>
    <td rowspan="5"><code>00000A</code> - <code>99999Z</code></td>
    <td rowspan="5"><code>1.000.000</code> - <code>3.599.999</code></td>
    <td><code>A</code></td>
    <td><code>00000A</code> - <code>99999A</code></td>
    <td><code>0</code> - <code>99.999</code></td>
  </tr>
  <tr>
    <td><code>B</code></td>
    <td><code>00000B</code> - <code>99999B</code></td>
    <td><code>100.000</code> - <code>199.999</code></td>
  </tr>
  <tr>
    <td><code>C</code></td>
    <td><code>00000C</code> - <code>99999C</code></td>
    <td><code>200.000</code> - <code>299.999</code></td>
  </tr>
  <tr>
    <td>...</td>
    <td>...</td>
    <td>...</td>
  </tr>
  <tr>
    <td><code>Z</code></td>
    <td><code>00000Z</code> - <code>99999Z</code></td>
    <td><code>2.500.000</code> - <code>2.599.999</code></td>
  </tr>
  <tr>
    <td rowspan="5"><code>####@@</code></td>
    <td rowspan="5"><code>0000AA</code> - <code>9999ZZ</code></td>
    <td rowspan="5"><code>3.600.000</code> - <code>10.359.999</code></td>
    <td><code>AA</code></td>
    <td><code>0000AA</code> - <code>9999AA</code></td>
    <td><code>0</code> - <code>9.999</code></td>
  </tr>
  <tr>
    <td><code>AB</code></td>
    <td><code>0000AB</code> - <code>9999AB</code></td>
    <td><code>10.000</code> - <code>19.999</code></td>
  </tr>
  <tr>
    <td><code>AC</code></td>
    <td><code>0000AC</code> - <code>9999AC</code></td>
    <td><code>20.000</code> - <code>29.999</code></td>
  </tr>
  <tr>
    <td>...</td>
    <td>...</td>
    <td>...</td>
  </tr>
  <tr>
    <td><code>ZZ</code></td>
    <td><code>0000ZZ</code> - <code>9999ZZ</code></td>
    <td><code>6.750.000</code> - <code>6.759.999</code></td>
  </tr>
  <tr>
    <td rowspan="5"><code>###@@@</code></td>
    <td rowspan="5"><code>000AAA</code> - <code>999ZZZ</code></td>
    <td rowspan="5"><code><code>10.360.000</code> - <code>27.935.999</code></td>
    <td><code>AAA</code></td>
    <td><code>000AAA</code> - <code>999AAA</code></td>
    <td><code>0</code> - <code>999</code></td>
  </tr>
  <tr>
    <td><code>AAB</code></td>
    <td><code>000AAB</code> - <code>999AAB</code></td>
    <td><code>1.000</code> - <code>1.999</code></td>
  </tr>
  <tr>
    <td><code>AAC</code></td>
    <td><code>000AAC</code> - <code>999AAC</code></td>
    <td><code>2.000</code> - <code>2.999</code></td>
  </tr>
  <tr>
    <td>...</td>
    <td>...</td>
    <td>...</td>
  </tr>
  <tr>
    <td><code>ZZZ</code></td>
    <td><code>000ZZZ</code> - <code>999ZZZ</code></td>
    <td><code>17.575.000</code> - <code>17.575.999</code></td>
  </tr>
  <tr>
    <td rowspan="5"><code>##@@@@</code></td>
    <td rowspan="5"><code>00AAAA</code> - <code>99ZZZZ</code></td>
    <td rowspan="5"><code>27.936.000</code> - <code>73.633.599</code></td>
    <td><code>AAAA</code></td>
    <td><code>00AAAA</code> - <code>99AAAA</code></td>
    <td><code>0</code> - <code>99</code></td>
  </tr>
  <tr>
    <td><code>AAAB</code></td>
    <td><code>00AAAB</code> - <code>99AAAB</code></td>
    <td><code>100</code> - <code>199</code></td>
  </tr>
  <tr>
    <td><code>AAAC</code></td>
    <td><code>00AAAC</code> - <code>99AAAC</code></td>
    <td><code>200</code> - <code>299</code></td>
  </tr>
  <tr>
    <td>...</td>
    <td>...</td>
    <td>...</td>
  </tr>
  <tr>
    <td><code>ZZZZ</code></td>
    <td><code>00ZZZZ</code> - <code>99ZZZZ</code></td>
    <td><code>45.697.500</code> - <code>45.697.599</code></td>
  </tr>
  <tr>
    <td rowspan="5"><code>#@@@@@</code></td>
    <td rowspan="5"><code>0AAAAA</code> - <code>9ZZZZZ</code></td>
    <td rowspan="5"><code>73.633.600</code> - <code>192.447.359</code></td>
    <td><code>AAAAA</code></td>
    <td><code>0AAAAA</code> - <code>9AAAAA</code></td>
    <td><code>0</code> - <code>9</code></td>
  </tr>
  <tr>
    <td><code>AAAAB</code></td>
    <td><code>0AAAAB</code> - <code>9AAAAB</code></td>
    <td><code>10</code> - <code>19</code></td>
  </tr>
  <tr>
    <td><code>AAAAC</code></td>
    <td><code>0AAAAC</code> - <code>9AAAAC</code></td>
    <td><code>20</code> - <code>29</code></td>
  </tr>
  <tr>
    <td>...</td>
    <td>...</td>
    <td>...</td>
  </tr>
  <tr>
    <td><code>ZZZZZ</code></td>
    <td><code>0ZZZZZ</code> - <code>9ZZZZZ</code></td>
    <td><code>118.813.750</code> - <code>118.813.759</code></td>
  </tr>
  <tr>
    <td rowspan="5"><code>@@@@@@</code></td>
    <td rowspan="5"><code>AAAAAA</code> - <code>ZZZZZZ</code></td>
    <td rowspan="5"><code>192.447.360</code> - <code>501.363.135</code></td>
    <td><code>AAAAAA</code></td>
    <td><code>AAAAAA</code> - <code>∅</code></td>
    <td><code>0</code> - <code>∅</code></td>
  </tr>
  <tr>
    <td><code>AAAAAB</code></td>
    <td><code>AAAAAB</code> - <code>∅</code></td>
    <td><code>1</code> - <code>∅</code></td>
  </tr>
  <tr>
    <td><code>AAAAAC</code></td>
    <td><code>AAAAAC</code> - <code>∅</code></td>
    <td><code>2</code> - <code>∅</code></td>
  </tr>
  <tr>
    <td>...</td>
    <td>...</td>
    <td>...</td>
  </tr>
  <tr>
    <td><code>ZZZZZZ</code></td>
    <td><code>ZZZZZZ</code> - <code>∅</code></td>
    <td><code>308.915.775</code> - <code>∅</code></td>
  </tr>
</table>

### 1.4 Core Logic

How do we find the `nth` License Plate?

- Split the plate into 2 parts:
  - Numeric part: the digits (`0-9`) at the start
  - Letter part: the letters (`A-Z`) at the end
- For a given letter suffix length `L`:
  - The number of digits = `6` - `L` (because total length is always `6`)
  - Numeric combinations = `10^(6 - L)` (all possible numbers of that length)
  - Letter combinations = `26^L` (all letter sequences of length `L`, since `26` letters)
- Total combinations for that letter suffix length:
  - `total` = `numeric combinations` × `letter combinations`
- Check if the target `licensePlateIndex` fits in these combinations:
  - If `licensePlateIndex < total`, the plate's letter suffix length is `L`
  - Else, subtract total from `licensePlateIndex` and try the next `L+1`
- Calculate numeric and letter parts:
  - Numeric part `index` = `licensePlateIndex` % `numeric combinations`. The modulo operation (%) gives the remainder when dividing the index by the number of numeric combinations. This remainder tells us where within the current letter group the License Plate falls — that is, which exact numeric sequence (like `000123`) it corresponds to
  - Letter group `index` = `licensePlateIndex` ÷ `numeric combinations`. Integer division tells us how many full blocks of numeric combinations fit into the index. Each block corresponds to a different letter suffix (like `A`, `B`, ..., `AA`, `AB`, etc.). So this quotient tells us which letter suffix group the license plate belongs to
- Convert these indexes to strings:
  - Numeric part: zero-padded number of length `6 - L`
  - Letter part: `base-26` representation of the letter group index, mapped to letters `A-Z`

Why does this work? Because the license plate sequence is organized as blocks:

- Each letter suffix group contains all numeric combinations (e.g., from `000000` to `999999`)
- The total license plates = (number of letter groups) × (number of numeric combos)
- Dividing the overall index by the numeric block size tells us which letter group we are in
- The remainder after that division gives the position inside that numeric block

This is essentially how numbering systems work when you have a base (like digits and letters combined): you break the number into "digits" of different bases by repeated division and modulo

### 1.5 Time Complexity (Big O Notation)

- The loop iterates over letter suffix lengths from `0` to `6`, so at most `7` iterations
- Inside the loop, operations like exponentiation, division, modulo, and base conversions are constant time for fixed-length plates
- Overall, the time complexity is `O(1)` — constant time regardless of the input `licensePlateIndex`
- Answer: `O(1)`

### 1.6 Space Complexity (Big O Notation)

- Fixed-size constants (digits `0-9`, letters `A-Z`) are of constant size: `10` and `26` respectively → `O(1)`
- Result strings (`numericChunk`, `letterChunk`) have a maximum length of `6` characters → `O(1)`
- Temporary variables (scalars, `BigNumber` instances) consume constant space → `O(1)`
- Memory usage does not scale with input `licensePlateIndex` (just like `Time Complexity`), so overall space complexity is `O(1)`
- Answer: `O(1)`

## Exercise 2 - JavaScript Concurrency

Given an array of URLs and a `MAX_CONCURRENCY` integer, implement a function that will asynchronously fetch each URL, not requesting more than `MAX_CONCURRENCY` URLs at the same time. The URLs should be fetched as soon as possible. The function should return an array of responses for each URL

### 1.1 Simple image data fetcher

This exercise demonstrates how to fetch multiple image URLs concurrently, while limiting the number of simultaneous HTTP requests. It retrieves image metadata, such as buffer size and dimensions, for each URL. The function returns an array where each element corresponds to either the image metadata or an error, preserving the order of the input URLs

### 1.2 Why a Queue?

A queue is used to control concurrency effectively. By using a queue with a fixed number of workers (`MAX_QUEUE_CONCURRENCY`), we ensure that no more than the allowed number of requests run at the same time. This avoids overwhelming the network or the remote servers and helps manage resource usage efficiently. Additionally, the queue preserves task order, enabling the results array to map back to the original input order

### 1.3 Time Complexity (Big O Notation)

- Each URL is fetched exactly once, and the overhead of managing the queue and callbacks scales linearly with the number of URLs. The concurrency controls do not increase the time complexity but do impact actual runtime performance by limiting simultaneous requests
- Answer: `O(n)` — where `n` is the number of URLs

### 1.4 Space Complexity (Big O Notation)

- The space complexity is linear because the function stores a results array with one slot per URL, and each slot holds either the image metadata or an error object. Additional memory is used for each HTTP response buffer and image dimension data but does not exceed `O(n)` overall
- Answer: `O(n)` — where `n` is the number of URLs
