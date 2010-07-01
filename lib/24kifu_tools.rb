#!/usr/bin/ruby
#  24kifu_tools.rb
#   2009/06/01
#   将棋倶楽部24または柿木形式の棋譜データテキストをもとに局面情報を生成し、
#   テーブルkifreadに入力するqueryに変換するための諸ツール
#   対象のテーブル: kifread, kifs
#
#   データは引数に指定したファイルから読み取る
#	棋譜データ
#		開始日時：2008/06/30 12:57:04
#		棋戦：レーティング対局室
#		手合割：平手
#		先手：fiasco
#		後手：mkumagai
#		手数----指手---------消費時間--
#		1 ７六歩(77)   ( 0:05/00:00:05)
#		2 ３四歩(33)   ( 0:01/00:00:01)
#		3 ２六歩(27)   ( 0:04/00:00:09)
#		4 ４四歩(43)   ( 0:01/00:00:02)
#		5 ４八銀(39)   ( 0:04/00:00:13)
#		6 ４二飛(82)   ( 0:02/00:00:04)
#		7 ６八玉(59)   ( 0:04/00:00:17)
#		略
#		134 ７二金(62)   ( 0:03/00:17:17)
#		135 ７二桂成(64)   ( 0:01/00:22:39)
#		136 ７二玉(82)   ( 0:02/00:17:19)
#		137 ６二金打     ( 0:02/00:22:41)
#		138 投了         ( 0:04/00:17:23)
#	手数と消費時間は読み捨ててよい
#	指手は全角数字、全角漢数字、 (数字数字)　からなる
$KCODE='u'

require 'jcode'
require 'logger'
$logger = Logger.new('log/kif2tbl.log')

#
# 入力 : 将棋盤の升目を右から左に、上から下に1から通し番号をふったときの値
# 出力 : その番号を通常の符号で呼ぶときの値を１０進数に読み替えた値
#  例  :   1 -> １一 -> 11
#         11 -> ２二 -> 22
def henkan(x)
  (((x-1)%9)+1)*10 + ((x-1)/9 + 1)
end

#
# 入力 : 将棋盤の升目を通常の符号で呼ぶときの値を１０進数に読み替えた値
# 出力 : 2ch流の盤面座標(縦に通番をふる。)
#  例  :  １一 -> 11 -> 1
#         ２二 -> 22 -> 11
def fugou_to_2ch(x)
  9*((x/10)-1)+1 + (x%10 - 1)
end

def zen2i(s)
# ７六 を 76 に、３四を 34 に変換する

  kanji = {1=>"一", 2=>"二", 3=>"三", 4=>"四", 5=>"五", 6=>"六", 7=>"七", 8=>"八", 9=>"九" }
  zenkaku = {1=>"１", 2=>"２", 3=>"３", 4=>"４", 5=>"５", 6=>"６", 7=>"７", 8=>"８", 9=>"９" }

  zenkaku.invert[s[0..2]]*10 + kanji.invert[s[3..5]]
end

# 
# 棋譜から読んだ指し手の文字列を2ch流のmoveを表すバイト列(unsigned char)に変換する
# 入力 : 指し手文字列(utf8)
# 出力 : 指し手バイト列(2byte)
#  例  : ７六歩(77) -> 77,76 -> 61,60 -> '=<'
#        ３四歩(33) -> 33,34 -> [21,22] -> '\025\026'
#        ７二桂成(64) -> 64,72 -> 49, 56+128 -> [49,184] -> '1\270'  # 成るときは２ch座標にしてから１２８を足す
#        ６二金打 -> 0,62 -> 0,47 -> [86,47] -> 'V/'  # 持ち駒は駒に応じて82..88に変換
#
def sasite2move(str, prev_to = nil)
  str = str.tr('１２３４５６７８９一二三四五六七八九','123456789123456789')
  from = str.match(/\(\d+\)/).to_s.tr('()','').to_i
  $logger.debug { "str : #{str},   from : #{from}" }
  case str
    when /同/
      return [fugou_to_2ch(from), fugou_to_2ch(prev_to.to_i)].pack("C*")
    when /打/
      str.tr!('歩香桂銀金角飛','0123456')
      return [str[2..2].to_i + 82, fugou_to_2ch(str[0..1].to_i)].pack("C*")
    when /成\(/
      return [fugou_to_2ch(from), fugou_to_2ch(str[0..1].to_i) + 128].pack("C*")
    else
      return [fugou_to_2ch(from), fugou_to_2ch(str[0..1].to_i)].pack("C*")
  end
end

def koma_name2i(s)
  n = {'王'=>7, '玉'=>7, '飛'=>6, '龍'=>(6|8), '竜'=>(6|8), '角'=>5, '馬'=>(5|8), '金'=>4, '銀'=>3, '成銀'=>(3|8), '桂'=>2, '成桂'=>(2|8), '香'=>1, '成香'=>(1|8), '歩'=>0, 'と'=>(0|8)}
  return n[s]
end

#
# textをsasiteの配列に変換する
#
def txt2ary(txt)

  sasite_ar = []
  sb_ar = []

  ar = txt.split("\n")
  ar.each{|e| e.strip! }
  $logger.error { "after split : #{ar.size} : #{ar.to_s}" }
  ar.delete_if{|line| /^\d+\/\d+\/\d/ =~ line  or
                    line[0] == '*' or 
                   !(/^\d/ =~ line) or 
                    /投了/ =~ line  or
                    /持将棋/ =~ line  or
                    /反則/ =~ line }
  $logger.error { "after delete : ar.size -> #{ar.size} : ar.to_s -> #{ar.to_s}" }

  ar.each{|e| $logger.error { e.to_s } }


  sb = Shougiban.new
  sb.init
  sb_ar.push(sb.to_struct)

  prev_to = ''

  ar.each{|line|
    $logger.error { "ar.line -> #{line}" }
    tesu = line.split(' ')[0].to_i
    te = line.split(' ')[1]
    $logger.error { "te -> #{te}" }
    if te[3..5] == '打' or te[6..8] == '打'
      from = 0
    else
      from = te.scan(/\d+/)[0].to_i
    end
    if te[0..2] == '同'
      to = prev_to
      if te[6..8] == '成'  #  成桂など
        name = (koma_name2i(te[6..11])+'a'[0]).chr
        nari = false
      else
        if (te[9..11] == '成')
          name = (koma_name2i(te[6..8])+'a'[0]).chr
	nari = true
        else
          name = (koma_name2i(te[6..8])+'a'[0]).chr
          nari = false
        end
      end
    else
      to = zen2i(te[0..5])
      if te[6..8] == '成'  #  成桂など
        name = (koma_name2i(te[6..11])+'a'[0]).chr
      else
        name = (koma_name2i(te[6..8])+'a'[0]).chr
      end
      nari = (te[9..11] == '成') ? true:false
    end
    name.upcase! if tesu % 2 == 1
    $logger.error { "#{te} : #{from} : #{to} : #{name} : #{nari}" }
    sasite = $ss.new(tesu,from,to,name,nari)
    sb.move2(sasite)
    sb.teban_chg
    sasite_ar.push(sasite)
    sb_ar.push(sb.to_struct)
    prev_to = to
    $logger.error { "#{sasite_ar.size}" }
  }  
  return [sasite_ar, sb_ar]
end


#
# txt2movebytes
#   textを2ch流のmoveの配列に変換する
# 入力 : 棋譜のテキスト
#   1行に1手で、複数行からなるテキスト
#   指し手よりも前や後の行に情報の行があっても削除するのでかまわない
# 出力 : 2ch流のmoveを並べたバイト列 
#
def txt2movebytes(txt)

  res = ''

  sasite_ar = []
  sb_ar = []

  # 余計なデータの掃除
  ar = txt.split("\n")
  ar.each{|e| e.strip! }
    #$logger.error { "after split : #{ar.size} : #{ar.to_s}" }
  ar.delete_if{|line|
       /^\d+\/\d+\/\d/    =~ line  or
       line[0]            == '*'   or 
       !(/^\d/            =~ line) or 
       /投了|持将棋|反則/ =~ line
  }
  # 掃除終了。ここではarには指し手の行のみがあるはず。
    #$logger.error { "after delete : ar.size -> #{ar.size} : ar.to_s -> #{ar.to_s}" }
    #ar.each{|e| $logger.error { e.to_s } }

  # 主処理

  # 同歩などの表現のときのためにtoにあたる座標を保持しておく
  prev_to = nil
  ar.inject(res){|m, line|
    $logger.error { "ar.line -> #{line}" }
    # 手数の読み取り。今、何手目か、という数値
    tesu = line.split(' ')[0].to_i
    # 指し手の文字列。４二金(41) とか。UTF-8を前提。全角は一文字３バイト。
    te = line.split(' ')[1]
    prev_to = te[0..5] unless /同/ =~ te
    $logger.error { "te -> #{te}" }
    res += sasite2move(te, prev_to)
  }  
  res
end

#
# kif_info
#   棋譜から対局情報を抽出しハッシュにして返す
# 入力:  kifu テキスト
# 出力:  hash
# そのhashのkeyの意味
#   g     : gameの日付 '2008-01-01' の形式
#   b     : 先手の名前
#   w     : 後手の名前
#   r     : 結果を一文字で表す 先手勝ちはb, 後手勝ちはw, 千日手はs, 持将棋はj 不明はu
#
def kif_info(kifu)
  res_hash = {}
  $logger.error { "10: res_hash is : #{res_hash}" }
  kifu.each_line{|line|
    if /日時/ =~ line
      res_hash['g'] = line.sub(%r![^\d]*(\d{4})/(\d{1,2})/(\d{1,2}).*!,'\1-\2-\3').sub(/[^\d-]/,'').chomp
      $logger.error { "20: res_hash is : #{res_hash}" }
      $logger.error { "21: res_hash[g] is : #{res_hash['g']}" }
    end
    if /先手：/ =~ line   
      res_hash['b'] = line.split('：')[1].chomp
      $logger.error { "30: res_hash is : #{res_hash}" }
    end
    if /後手：/ =~ line   
      res_hash['w'] = line.split('：')[1].chomp
      $logger.error { "40: res_hash is : #{res_hash}" }
    end
    if /投了/ =~ line   
      res_hash['r'] = (line.sub(/(\d+)/,'\1').to_i%2==0 ? 'b' : 'w')
      $logger.error { "60: res_hash is : #{res_hash}" }
    end
    if /持将棋/ =~ line   
      res_hash['r'] = 'j'
      $logger.error { "70: res_hash is : #{res_hash}" }
    end
    if /千日手/ =~ line   
      res_hash['r'] = 's'
      $logger.error { "80: res_hash is : #{res_hash}" }
    end
  }
  res_hash['r'] = 'u' unless res_hash['r']
  $logger.error { "90: res_hash is : #{res_hash}" }
  return res_hash
end

#
# kifuテキストを与えられ、指し手をkifreadに登録するSQL文にしてhashを組み立てて返す
# そのhashのkeyと意味は次のとおり
#   query : 指し手をSQLにした文
#
def kif2sql(kifu)
  res_hash = {}
  
  $logger.error { "kif2sql start." }
  sasite_ar, sb_ar = txt2ary(kifu)
  ret = ''
  $logger.error { "return from txt2ary." }

  0.upto(sasite_ar.size-1){|i|
    ret += "insert into kifread values(\
      #{sasite_ar[i].tesu}, #{sasite_ar[i].from}, #{sasite_ar[i].to}, '#{sasite_ar[i].chr}', #{sasite_ar[i].nari}, \
      #{sb_ar[i].teban=='s'}, '#{sb_ar[i].s_moti}','#{sb_ar[i].ban}', '#{sb_ar[i].g_moti}');" 
    ret += "\n"
  }

  i = sb_ar.size - 1
  ret += "insert into kifread values(\
   #{i+1}, null, null, null, null, \
   #{sb_ar[i].teban=='s'}, '#{sb_ar[i].s_moti}','#{sb_ar[i].ban}', '#{sb_ar[i].g_moti}');" 
   
  $logger.error { "kif2sql: query created." }
  res_hash['query'] = ret
  return res_hash
end

#
# kifuテキストからすべての情報を読み取り、hashを組み立てて返す
#
def kif2query(kifu)
  return kif2sql(kifu).update(kif_info(kifu))
end
