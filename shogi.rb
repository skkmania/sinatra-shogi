require 'rubygems'
require 'sinatra'
require 'msgpack'
require 'json'
require 'get84.rb'
require 'public/cc_getData.rb'

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

get '/hello/:name' do
    # matches "GET /hello/foo" and "GET /hello/bar"
    # params[:name] is 'foo' or 'bar'
    "Hello #{params[:name]}!"
end

get %r{/lesser/([\d]+)} do
  bid = params[:captures].first
  dataset = DB["select * from boards where bid < #{bid}"]
  dataset.inject('') do |all, row|
    all += row.to_a.join(':') + '<br>'
  end
end

get %r{/board/([\d]+)} do
  bid = params[:captures].first
  dataset = DB["select * from boards where bid = #{bid}"]
  dataset.inject('') do |all, row|
    all += row.inspect.gsub(/:(\w+)/){ '"' + $1 + '"' }.gsub('=>',':').gsub('"{','[').gsub('}"',']')
  end
end

=begin
# これは上の条件にあわなかったすべての文字列にヒットすることに注意
get '/:bid' do |bid|
  logger.debug { 'into bid' }
  bid.to_s
  dataset = DB["select * from boards where bid = #{bid.to_s}"]
  dataset.inject('') do |all, row|
    all += row.to_a.join(':') + '\n'
  end
end
=end

get '/getData' do
    logger.debug { 'into getData' }
    logger2.debug { 'into getData' }
  ct = CacheTest.new( params, logger2 )
    logger2.debug { 'ct initialized' }
  ct.determine_bid_range
    logger2.debug { 'determined' }
  #body = ct.get_data.to_json
  body = ct.get_data.to_json
    logger2.debug { body['bids'] or 'null' }
  #body['bids'].gsub!('"{','[').gsub!('}"',']')
    logger2.debug { 'get_data' }
    logger2.debug { body.to_s }
  #r.write ct.get_data
    logger2.debug { 'output done' }
  r = Sinatra::Response.new(body,200,{"Content-Type" => "application/json"})
  r.finish
end

post '/getData' do
    logger2.debug { 'into getData' }
  ct = CacheTest.new( params, logger2 )
    logger2.debug { 'ct initialized' }
  ct.determine_bid_range
    logger2.debug { 'determined' }
  #body = ct.get_data.to_json
  body = ct.get_data.to_json
    logger2.debug { body['bids'] or 'null' }
  #body['bids'].gsub!('"{','[').gsub!('}"',']')
    logger2.debug { 'get_data' }
    logger2.debug { body.to_s }
  #r.write ct.get_data
    logger2.debug { 'output done' }
  r = Sinatra::Response.new(body,200,{"Content-Type" => "application/json"})
  r.finish
end

# サーバ側でデータを返すだけならこのようなコードになる
# この場合、クライアント側で受け取ったデータを各要素に充填していく
get %r{/json/board/([\d]+)} do
  bid = params[:captures].first
  dataset = DB["select * from boards where bid = #{bid}"]
  body = dataset.inject('') do |all, row|
    all += row.inspect.gsub(/:(\w+)/){ '"' + $1 + '"' }.gsub('=>',':').gsub('"{','[').gsub('}"',']')
  end
  r = Sinatra::Response.new(body,200,{"Content-Type" => "application/json"})
  r.finish
end

# サーバ側でページ生成までしてしまうならこのようなコードになる
get %r{/(bids|board|nextMoves|prevMoves)/([\d]+)} do
  name,bid = params[:captures]
  ct = CacheTest.new({ :name => name, :bid => bid, :range => 'full' }, logger2 )
  ct.determine_bid_range
  body = ct.to_html
  r = Sinatra::Response.new(body,200,{"Content-Type" => "text/html"})
  r.finish
end

# message packの練習
get %r{/msg/board/([\d]+)} do
  bid = params[:captures].first
  dataset = DB["select * from boards where bid = #{bid}"]
  body = dataset.all.to_msgpack
  r = Sinatra::Response.new(body,200,{"Content-Type" => "text/html"})
  r.finish
end

get '/getMsg' do
    logger2.debug { 'into getMsg' }
  ct = CacheTest.new( params, logger2 )
    logger2.debug { 'ct initialized' }
  ct.determine_bid_range
    logger2.debug { 'determined' }
  body = ct.get_msg
    logger2.debug { 'data gotten' }
  r = Sinatra::Response.new(body,200,{"Content-Type" => "text/plain"})
  r.finish
end

get '/getBids' do
    logger2.debug { 'into getBids' }
  ct = CacheTest.new( params, logger2 )
    logger2.debug { 'ct initialized' }
  ct.determine_bid_range
    logger2.debug { 'determined' }
  body = ct.get_bids
    logger2.debug { 'data gotten' }
  r = Sinatra::Response.new(body,200,{"Content-Type" => "text/plain"})
  r.finish
end

# パラメータ：board, moveの情報
# 機能：DBにそれらを登録
post '/bid' do
    logger2.debug { 'into post bid' }
    logger2.debug { 'params : ' + params.inspect }
  ct = CacheTest.new( params, logger2 )
  body = ct.regist_board_move( params )
  r = Sinatra::Response.new(body,201,{"Content-Type" => "text/plain"})
  r.finish
end
