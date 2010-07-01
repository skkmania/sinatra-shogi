#!/usr/bin/ruby
#  regist24kif.rb
#   将棋倶楽部24の1局ぶんの棋譜データテキストのファイルを読み、局面情報を生成し、
#   shogi84データベースに登録する
#   2010/05/19
#
#   データは引数に指定したファイルから読みとる
#   Usage:
#     ruby regist24kif.rb file_name
#     file_nameは24の棋譜のテキストファイル。utf8で記述されていること。

require  '24kifu_tools.rb'
require  '../db2ch/2chkifutools.rb'
require  '../lib/db_connect.rb'
$logger24 = Logger.new('log/regist24kif.log')


def create_query(meta_data, kifu_bytedata)
  query = 'delete from kifread;'
  query += 'delete from new_boards;'
  query += 'delete from new_moves;'
  query += bytes_to_query_text_type(kifu_bytedata, kifu_bytedata.length/2)
  query += "select kif_insert(null, '#{meta_data['g']}', '#{meta_data['b']}', '#{meta_data['w']}', '#{meta_data['r']}');"
    # こちらから登録するときは最初の引数（id on 2ch)は null とする
  query += 'delete from kifread;'
  $logger24.debug { query }
  query
end

def insert_on_db(query)
  begin
    db = connect_db
    kekka = db.run(query)
    $logger24.debug { "regist24kif.rb: kekka is #{kekka}" }
  rescue
    db.disconnect
  else
    print kekka
    db.disconnect
  end
end

# main
unless FileTest.exist?(  filename = ARGV[0] )
  puts '#{filename} not found.'
  puts 'Usage : ruby regist24kif.rb filename'
  exit
else
  # ファイルの内容を文字列にしまう
  kifu_alltext = File.read(filename)

  # メタデータを抽出(対局日、プレイヤー名、勝敗など）
  meta_data = kif_info(kifu_alltext)
  $logger24.debug { 'information about this game : ' + meta_data.to_a.join(':') }

  # 指し手を2ch流のバイナリデータのバイト列にしたものを取得
  kifu_bytedata = txt2movebytes(kifu_alltext)
  $logger24.debug { 'kifu data is transformed in to a seriese of byte : \n' + kifu_bytedata }
  $logger24.debug { "the length of this byte is : #{kifu_bytedata.length}" }

  # メタデータとバイト列を渡してSQL queryに変換
  query = create_query(meta_data, kifu_bytedata)
  $logger24.debug { "those data is made into a query: \n #{query}" }

  # 生成したqueryをSQLサーバにて実行
  insert_on_db(query)
end

