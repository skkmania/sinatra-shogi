require 'rubygems'
require 'sinatra'
require 'msgpack'
require 'json'
require 'lib/db_accessor.rb'

configure do
  LOGGER = Logger.new("log/sinatra.log") 
  LOGGER2 = Logger.new('log/shogi.log')
end
 
helpers do
  def logger
    LOGGER
  end
  def logger2
    LOGGER2
  end
end

get %r{/board/([\d]+)} do
  bid = params[:captures].first
  dataset = DB["select * from boards where bid = #{bid}"]
  dataset.inject('') do |all, row|
    all += row.inspect.gsub(/:(\w+)/){ '"' + $1 + '"' }.gsub('=>',':').gsub('"{','[').gsub('}"',']')
  end
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


# message packの練習
get %r{/msg/board/([\d]+)} do
  bid = params[:captures].first
  dataset = DB["select * from boards where bid = #{bid}"]
  body = dataset.all.to_msgpack
  r = Sinatra::Response.new(body,200,{"Content-Type" => "text/html"})
  r.finish
end

get '/getMsg' do
    logger2.debug { '-----  getMsg is called ----' }
    logger2.debug { '  with params : ' + params.inspect }
    logger2.debug { '  DbAccessor をまず初期化して取得' }
  ct = DbAccessor.new( params, logger2 )
    logger2.debug { '  DbAccessor の取得に成功' }
    logger2.debug { '  data取得のためbid rangeを求める' }
  ct.determine_bid_range
    logger2.debug { '  bid range が求まった。ので、get_msgを呼ぶ' }
  body = ct.get_msg.to_msgpack
    logger2.debug { 'wanted data is successfully gotten' }
    logger2.debug { "so, going to dispatch response\n" }
  r = Sinatra::Response.new(body,200,{"Content-Type" => "text/plain"})
  r.finish
end

# パラメータ：board, moveの情報
# 機能：DBにそれらを登録
post '/bid' do
  logger2.debug { '-------  into post bid --------' }
  logger2.debug { 'params : ' + params.inspect }
  da = DbAccessor.new( params, logger2 )
  body = da.regist_board
  logger2.debug { 'response.body : ' + body.inspect }
  #logger2.debug { 'response.body : ' + MessagePack.unpack(body).inspect }
  r = Sinatra::Response.new(body.to_msgpack,
                            200,{"Content-Type" => "text/plain"})
  r.finish
end

# 棋譜を出力
# parameter : kid 棋譜のid
# 機能： kifsテーブルにあるkidの棋譜をmoveの羅列にして返す
# 出力形式： 
get '/book' do
    logger2.debug { ' ----------  into get book' }
    logger2.debug { 'params : ' + params.inspect }
  da = DbAccessor.new( params, logger2 )
    logger2.debug { 'DbAccessor initialized : ' + da.inspect }
  body = da.get_book
    logger2.debug { 'response.body : ' + MessagePack.unpack(body).inspect }
  #r = Sinatra::Response.new(body,200,{"Content-Type" => "text/html"})
  r = Sinatra::Response.new(body,200,{"Content-Type" => "text/plain"})
  r.finish
end

# 棋譜を入力
# parameter : 24形式の棋譜テキスト（棋譜とメタデータを含む）
#   text : 文字列 .kifファイル全文
# 機能： クライアントから送られた棋譜をkifs, boards, moves に登録し、
#        レスポンスとして、kifsの１レコード（のhashのpack)を返す
# 出力形式：以下の例をMessagePackでpackして得られる文字列
#    [{"white"=>"fiasco",
#      "result"=>"w",
#      "gdate"=>"2009-12-11",
#      "black"=>"sisi0531",
#      "new_move"=>"111111",
#      "id2ch"=>nil,
#      "kid"=>202,
#      "kif"=>"1,0,77,76,P,f,2:2,0,33,34,p,f,3:3,..と、:区切りで手数ぶん
#      "tesu"=>98}]
# 
post '/book' do
    logger2.debug { ' ----------  into post book' }
    logger2.debug { 'params : ' + params.inspect }
  da = DbAccessor.new( params, logger2 )
    logger2.debug { 'DbAccessor initialized : ' + da.inspect }
  body = da.post_book
    logger2.debug { 'response.body : ' + MessagePack.unpack(body).inspect }
  r = Sinatra::Response.new(body,200,{"Content-Type" => "text/plain"})
  r.finish
end
