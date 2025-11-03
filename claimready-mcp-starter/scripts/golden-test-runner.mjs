import fs from 'fs'
import path from 'path'
import axios from 'axios'
import 'dotenv/config'

const goldensDir = path.resolve(process.cwd(), 'goldens')
const inputsDir = path.join(goldensDir, 'inputs')
const expectedDir = path.join(goldensDir, 'expected')

const parserBase = process.env.PARSER_BASE_URL || 'http://localhost:8100'

let failures = 0
const files = fs.readdirSync(inputsDir).filter(f => f.endsWith('.txt') || f.endsWith('.md') || f.endsWith('.json'))
for (const f of files) {
  const id = path.basename(f, path.extname(f))
  const text = fs.readFileSync(path.join(inputsDir, f), 'utf8')
  const { data } = await axios.post(`${parserBase}/parse`, { id, text })
  const expectedPath = path.join(expectedDir, id + '.json')
  if (!fs.existsSync(expectedPath)) {
    console.error(`[MISSING EXPECTED] ${id}`)
    failures++
    continue
  }
  const expected = JSON.parse(fs.readFileSync(expectedPath, 'utf8'))
  const ok = JSON.stringify(expected) === JSON.stringify(data)
  if (!ok) {
    console.error(`[DIFF] ${id}`)
    console.error('Expected:', JSON.stringify(expected, null, 2))
    console.error('Actual  :', JSON.stringify(data, null, 2))
    failures++
  } else {
    console.log(`[PASS] ${id}`)
  }
}
process.exit(failures === 0 ? 0 : 1)
