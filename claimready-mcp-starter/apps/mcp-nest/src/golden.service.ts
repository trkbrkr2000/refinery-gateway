import * as fs from 'fs'
import * as path from 'path'
import axios from 'axios'

export class GoldenService {
  goldensDir = path.resolve(process.cwd(), 'goldens')
  async run(parserBaseUrl: string) {
    const inputsDir = path.join(this.goldensDir, 'inputs')
    const expectedDir = path.join(this.goldensDir, 'expected')
    const files = fs.readdirSync(inputsDir).filter(f => f.endsWith('.txt') || f.endsWith('.md') || f.endsWith('.json'))
    const diffs: any[] = []
    for (const f of files) {
      const id = path.basename(f, path.extname(f))
      const body = { id, text: fs.readFileSync(path.join(inputsDir, f), 'utf8') }
      const { data } = await axios.post(`${parserBaseUrl}/parse`, body, { timeout: 30000 })
      const expectedPath = path.join(expectedDir, id + '.json')
      if (!fs.existsSync(expectedPath)) {
        diffs.push({ id, error: 'missing expected file' })
        continue
      }
      const expected = JSON.parse(fs.readFileSync(expectedPath, 'utf8'))
      const actual = data
      if (JSON.stringify(expected) !== JSON.stringify(actual)) {
        diffs.push({ id, expected, actual })
      }
    }
    return { diffs }
  }
}
