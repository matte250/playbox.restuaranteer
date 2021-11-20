Feature: Auth
Background:
    * url baseUrl + 'api/auth/v1'

Scenario: Create new user
    * def registerRequest = 
    """
    {
        "email": "test@test.test",
        "password": "testtest",
        "name": "Tester"
    }
    """
    Given path 'register'
    And request registerRequest
    When method post
    Then status 200
