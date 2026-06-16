import AllureReporter from '@wdio/allure-reporter'
import { Status } from 'allure-js-commons'

const PREFIX = '>>>'

export async function step<T>(label: string, fn: () => Promise<T>): Promise<T> {
  const start = Date.now()
  console.log(`\n${PREFIX} ${label}`)
  void AllureReporter.startStep(label)
  try {
    const result = await fn()
    const ms = Date.now() - start
    console.log(`    OK (${ms}ms)`)
    void AllureReporter.endStep(Status.PASSED)
    return result
  } catch (err) {
    const ms = Date.now() - start
    console.log(`    FAIL (${ms}ms)`)
    void AllureReporter.endStep(Status.FAILED)
    throw err
  }
}
