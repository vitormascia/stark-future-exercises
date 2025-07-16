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
    <td rowspan="5">000000 - 999999</td>
    <td rowspan="5">0 - 999.999</td>
    <td>∅</td>
    <td>∅</td>
    <td>∅</td>
  </tr>
  <tr>
    <td>∅</td>
    <td>∅</td>
    <td>∅</td>
  </tr>
  <tr>
    <td>∅</td>
    <td>∅</td>
    <td>∅</td>
  </tr>
  <tr>
    <td>...</td>
    <td>...</td>
    <td>...</td>
  </tr>
  <tr>
    <td>∅</td>
    <td>∅</td>
    <td>∅</td>
  </tr>
  <tr>
    <td rowspan="5">#####@</td>
    <td rowspan="5">00000A - 99999Z</td>
    <td rowspan="5">1.000.000 - 3.599.999</td>
    <td>A</td>
    <td>00000A - 99999A</td>
    <td>0 - 99.999</td>
  </tr>
  <tr>
    <td>B</td>
    <td>00000B - 99999B</td>
    <td>100.000 - 199.999</td>
  </tr>
  <tr>
    <td>C</td>
    <td>00000C - 99999C</td>
    <td>200.000 - 299.999</td>
  </tr>
  <tr>
    <td>...</td>
    <td>...</td>
    <td>...</td>
  </tr>
  <tr>
    <td>Z</td>
    <td>00000Z - 99999Z</td>
    <td>2.500.000 - 2.599.999</td>
  </tr>
  <tr>
    <td rowspan="5">####@@</td>
    <td rowspan="5">0000AA - 9999ZZ</td>
    <td rowspan="5">3.600.000 - 10.359.999</td>
    <td>AA</td>
    <td>0000AA - 9999AA</td>
    <td>0 - 9.999</td>
  </tr>
  <tr>
    <td>AB</td>
    <td>0000AB - 9999AB</td>
    <td>10.000 - 19.999</td>
  </tr>
  <tr>
    <td>AC</td>
    <td>0000AC - 9999AC</td>
    <td>20.000 - 29.999</td>
  </tr>
  <tr>
    <td>...</td>
    <td>...</td>
    <td>...</td>
  </tr>
  <tr>
    <td>ZZ</td>
    <td>0000ZZ - 9999ZZ</td>
    <td>6.750.000 - 6.759.999</td>
  </tr>
  <tr>
    <td rowspan="5">###@@@</td>
    <td rowspan="5">000AAA - 999ZZZ</td>
    <td rowspan="5">10.360.000 - 27.935.999</td>
    <td>AAA</td>
    <td>000AAA - 999AAA</td>
    <td>0 - 999</td>
  </tr>
  <tr>
    <td>AAB</td>
    <td>000AAB - 999AAB</td>
    <td>1.000 - 1.999</td>
  </tr>
  <tr>
    <td>AAC</td>
    <td>000AAC - 999AAC</td>
    <td>2.000 - 2.999</td>
  </tr>
  <tr>
    <td>...</td>
    <td>...</td>
    <td>...</td>
  </tr>
  <tr>
    <td>ZZZ</td>
    <td>000ZZZ - 999ZZZ</td>
    <td>17.575.000 - 17.575.999</td>
  </tr>
  <tr>
    <td rowspan="5">##@@@@</td>
    <td rowspan="5">00AAAA - 99ZZZZ</td>
    <td rowspan="5">27.936.000 - 73.633.599</td>
    <td>AAAA</td>
    <td>00AAAA - 99AAAA</td>
    <td>0 - 99</td>
  </tr>
  <tr>
    <td>AAAB</td>
    <td>00AAAB - 99AAAB</td>
    <td>100 - 199</td>
  </tr>
  <tr>
    <td>AAAC</td>
    <td>00AAAC - 99AAAC</td>
    <td>200 - 299</td>
  </tr>
  <tr>
    <td>...</td>
    <td>...</td>
    <td>...</td>
  </tr>
  <tr>
    <td>ZZZZ</td>
    <td>00ZZZZ - 99ZZZZ</td>
    <td>45.697.500 - 45.697.599</td>
  </tr>
  <tr>
    <td rowspan="5">#@@@@@</td>
    <td rowspan="5">0AAAAA - 9ZZZZZ</td>
    <td rowspan="5">73.633.600 - 192.447.359</td>
    <td>AAAAA</td>
    <td>0AAAAA - 9AAAAA</td>
    <td>0 - 9</td>
  </tr>
  <tr>
    <td>AAAAB</td>
    <td>0AAAAB - 9AAAAB</td>
    <td>10 - 19</td>
  </tr>
  <tr>
    <td>AAAAC</td>
    <td>0AAAAC - 9AAAAC</td>
    <td>20 - 29</td>
  </tr>
  <tr>
    <td>...</td>
    <td>...</td>
    <td>...</td>
  </tr>
  <tr>
    <td>ZZZZZ</td>
    <td>0ZZZZZ - 9ZZZZZ</td>
    <td>118.813.750 - 118.813.759</td>
  </tr>
  <tr>
    <td rowspan="5">@@@@@@</td>
    <td rowspan="5">AAAAAA - ZZZZZZ</td>
    <td rowspan="5">192.447.360 - 501.363.135</td>
    <td>AAAAAA</td>
    <td>AAAAAA - ∅</td>
    <td>0 - ∅</td>
  </tr>
  <tr>
    <td>AAAAAB</td>
    <td>AAAAAB - ∅</td>
    <td>1 - ∅</td>
  </tr>
  <tr>
    <td>AAAAAC</td>
    <td>AAAAAC - ∅</td>
    <td>2 - ∅</td>
  </tr>
  <tr>
    <td>...</td>
    <td>...</td>
    <td>...</td>
  </tr>
  <tr>
    <td>ZZZZZZ</td>
    <td>ZZZZZZ - ∅</td>
    <td>308.915.775 - ∅</td>
  </tr>
</table>

### 1.4 Core Logic

Consider a license plate format of length `6` consisting of digits (`0-9`) and letters (`A-Z`). For any given suffix length of letters:

- The number of numeric combinations = `10^number of digit positions`
- Each unique letter combination corresponds to a block of numeric combinations

So:

- `licensePlateIndex` ÷ `numericCombinations` gives the letter group index (which letter suffix)
- `licensePlateIndex` % `numericCombinations` gives the numeric part within that letter group

The plates are ordered lexicographically, meaning:

- All numeric variations of `00000A` come first
- Then all numeric variations of `00000B`
- And so on...

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
