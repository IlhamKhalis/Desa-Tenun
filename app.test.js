const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../app');
const { expect } = chai;

chai.use(chaiHttp);

describe('App', () => {
    it('should return Hello World on GET /', (done) => {
        chai.request(app)
            .get('/')
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res.text).to.equal('Hello World!');
                done();
            });
    });

    it('should return sum on GET /add', (done) => {
        chai.request(app)
            .get('/add?a=1&b=2')
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res.body).to.have.property('sum').eql(3);
                done();
            });
    });
});
