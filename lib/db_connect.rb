  require 'rubygems'
  require 'logger'
  require 'sequel'

  #localhostへの接続
def connect_db
  Sequel.connect("postgres://skkmania:skkmania@localhost:5432/shogi84",
    :max_connections => 10, :logger => Logger.new('log/db_shogi84.log'))
end
