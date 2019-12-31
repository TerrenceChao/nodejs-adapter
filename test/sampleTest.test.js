const { expect } = require('chai')

describe('sample test', () => {
  before(() => {
    console.log('before testing')
  })

  it('test a sample', () => {
    // assert
    expect(1 + 1).to.equals(2)
  })
})
