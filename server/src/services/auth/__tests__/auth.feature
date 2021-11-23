Feature: Auth
Background:
    * def auth = call read('login.feature')
    * header Authorization = "Bearer " + auth.response.result
    * url baseUrl + '/api/auth/v1'

Scenario: Create new user and get user
    Given path 'register'
    And request
        """
            {
                "email": "userthatdidnotexist@test.test",
                "password": "testtest",
                "name": "Tester"
            }
        """
    When method post
    Then status 200
    And def id = response.result.id
    
    Given path 'user', id
    When method Get
    Then status 200
    And match response == { result: { id: #(id), name: '#string', email: '#string' }}