require 'rubygems'
require 'logger'
require 'sinatra'
require 'json'

set :port, 9494

configure do
  LOGGER = Logger.new("log/sinatra.log") 
  LOGGER2 = Logger.new('log/cc_getData.log')
end
 
helpers do
  def logger
    LOGGER
  end
  def logger2
    LOGGER2
  end
end

get '/hi' do
  logger.debug { 'into hi' }
  "Hello World!"
end
