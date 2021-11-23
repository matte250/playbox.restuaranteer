Feature: Login
Background:
    * url baseUrl + '/api/auth/v1'
Scenario: Log in test user
    Given path 'login'
    And request { "email": "test@test.test", "password": "testtest" }
    When method post
    Then status 200