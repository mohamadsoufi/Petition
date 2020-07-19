const supertest = require("supertest")
const { app } = require('./index')
const cookieSession = require('cookie-session');


test('GET /logged out are redirected to the registration page', () => {
    cookieSession.mockSessionOnce({});
    return supertest(app).get('/petition').then(response => {
        // console.log('response :', response);
        expect(response.header.location).toBe('/login')
    })
});

test('GET /logged in are redirected to the petition page', () => {
    cookieSession.mockSessionOnce({
        userId: 'mohamad'
    });
    return supertest(app).get('/register').then(response => {
        expect(response.header.location).toBe('/petition')
    })
});

test('GET /logged in are redirected to the petition page', () => {
    cookieSession.mockSessionOnce({
        userId: 'mohamad'
    });
    return supertest(app).get('/login').then(response => {
        expect(response.header.location).toBe('/petition')
    })
});

test('GET /logged in and signed are redirected to the thanks page', () => {
    cookieSession.mockSessionOnce({
        userId: 'mohamad',
        signatureId: 1
    });
    return supertest(app).get('/petition').then(response => {
        expect(response.header.location).toBe('/thanks')
    })
});

test('post /logged in and signed are redirected to the thanks page', () => {
    cookieSession.mockSessionOnce({
        userId: 'mohamad',
        signatureId: 1
    });
    return supertest(app).post('/petition').then(response => {
        expect(response.header.location).toBe('/thanks')
    })
});

test('GET /logged in and not signed are redirected to the petition page', () => {
    cookieSession.mockSessionOnce({
        userId: 'mohamad',
        signatureId: ''
    });
    return supertest(app).get('/thanks').then(response => {
        expect(response.header.location).toBe('/petition')
    })
});


// i want them to be allowed :)
// test('GET /logged in and not signed are redirected to the petition page', () => {
//     cookieSession.mockSessionOnce({
//         userId: 'mohamad',
//         signatureId: ''
//     });
//     return supertest(app).get('/signers').then(response => {
//         expect(response.header.location).toBe('/petition')
//     })
// });