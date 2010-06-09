require 'client'
require 'test/unit'
require 'rack/test'

set :environment, :test

class ClientTest < Test::Unit::TestCase
  include Rack::Test::Methods

  def app
    Sinatra::Application
  end

  def test_it_says_hi
    get '/hi'
    assert last_response.ok?
    assert_equal 'Hello World!', last_response.body
  end

  def test_it_says_hello_to_a_person
    get '/hello/Simon'
    #get '/hello/:name', :name => 'Simon'
    assert last_response.ok?
    assert last_response.body.include?('Simon')
  end
end
