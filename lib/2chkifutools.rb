#
#  2chkifutools.rb
#   2chkifuのデータを扱う道具
#   2008/12/2
#

#共通変数

  # 2chkifuと同じ配列の将棋盤
  # １一から縦に1,2,3とふっていく
  # その初期盤面が下記のとおり
  # 駒を表すアルファベットは英語表記の駒の名前の頭文字からきている
  $board_2ch =" lxpxxxPxLnbpxxxPRNsxpxxxPxSgxpxxxPxGkxpxxxPxKgxpxxxPxGsxpxxxPxSnrpxxxPBNlxpxxxPxL".split(//)

  # 持ち駒の個数のハッシュ
  $black_stand = { "P" => 0, "L" => 0, "N" => 0, "S" => 0, "G" => 0, "B" => 0, "R" => 0 } 
  $white_stand = { "p" => 0, "l" => 0, "n" => 0, "s" => 0, "g" => 0, "b" => 0, "r" => 0 } 

  # 盤と駒台
  $board_info = [$board_2ch, $black_stand, $white_stand]

def henkan(x)
  # 入力 x : 1byte unsigned int
  # 返り値 ： 6七 -> 67 のように符号をそのまま数字にかえたもの

  # 2chkifuでは盤面の各マスを１バイトの数字で表している
  # 1一から1九までが1,2,3...9と縦に順に数字をふっていく
  # 2一から2九までが10,11,...18
  #  .....
  # 9一から9九までが73,74,...81
  # それを、人間の読みやすい表現の数字(DBで使用している）に変換する関数
  # また、成り駒、持ち駒のことも考慮する
  # 成り駒の場合、盤面座標に128を足してあるのでこれを引く
  # 持ち駒は、82 - 88 の値をとる。DBでは持ち駒のfrom座標を0とする
  # 
  return 0 if (82..88).include?(x)
  x -= 128 if x > 128
  x%9 == 0 ?  (((x-1)/9)+1)*10 + 9 : (((x-1)/9)+1)*10 + x%9
end

def get_kifu_info(hdr_file, id)
  # 入力値 ヘッダファイル名 棋譜の2chid
  # 返り値 idで指定した棋譜のbin_pos, 先手、後手の氏名、手数、結果、日付

  # bin_pos とは、
  # binファイルにおいて、id の棋譜の始まる位置（バイトカウント）である。
  # id を与えられると、2chkifu.hdrファイルを先頭からサーチして
  # 順々に各棋譜の手数からバイト数の累積を求め返す。
  # 各棋譜はその棋譜の手数情報4バイトから始まる
  # ここで返すのは、その手数情報の直前までに読むべきバイト数である
  accum = 0; kif_num = 0; black = ''; white = ''; tesu = 0; result = ''; gdate = ''
  open(hdr_file,"r") do |src|
    while line = src.gets
      if /^\d/ =~ line then
        num_ary = line.scan(/\d+/)
        break if num_ary[0].to_i == id
        kif_num += 1
        accum += num_ary[3].to_i
      end
    end
    tesu = num_ary[3].to_i
    case
      when line =~ /先手の勝ち/
        result = 'b'
      when line =~ /後手の勝ち/
        result = 'w'
      when line =~ /千日手/
        result = 's'
      when line =~ /持将棋/
        result = 'j'
      else
        result = 'u'
    end
    line = src.gets; black = line.split('：')[1].chomp
    line = src.gets; white = line.split('：')[1].chomp
    line = src.gets; gdate = line.split('：')[1].chomp.gsub(/\//,'-')
  end
  # kif_num は最初の１行のせいで１増えてしまっているので修正
  kif_num -= 1
  # 先頭の8バイト + 4バイト（各棋譜の手数）*kif_num + 2バイト（各手）*accum
  bin_pos = 8 + 4*kif_num + 2*accum
  [bin_pos, black, white, tesu, result, gdate]
end

# board_2ch_to_db(bd2c)
# deprecated
# 昔はDB上はboardの文字列は横並びに読む形式だった
# 今(shogi84以降)はDB上も縦に読む形式にしたのでこの関数は使わなくなった。
# 2chの盤面配列をDB形式の文字列にして返す
# 2次元行列の転置みたいな操作。xは横軸、yは縦軸というイメージ。
def board_2ch_to_db(bd2c)
  ret = []
  bd2c.each_with_index{|e,i|
    n = i - 1
    x = n/9 + 1
    y = n%9 + 1
    j = x + (y - 1)*9
    ret[j] = e
  }
  ret.join
end

# 持ち駒のハッシュをうけとり、DB形式の文字列にして返す
# 結果の文字列は駒の強い順に並べる
#  つまり、RBGSNLPの順序となる(飛、角、金、銀、桂、香、歩）
# その理由は２つある
#   1. 常に一定のルールにしたがわないと、盤面情報の比較に支障をきたす
#      (同じ持ち駒なのに違う文字列だと、異なる持ち駒だと判断されてしまう
#   2. 持ち駒を画面に表示するときにそのほうが便利
def stand_to_str(stand)
  ret = ''
  return ret if stand.empty?
  'rbgsnlp'.split('').each do |k|
    (stand[p=k] or stand[p=k.upcase] or 0).times{ ret += p }
  end
  ret
end

# promote(piece)
# 駒をうけとって成り駒にして反す
# 入力： piece 文字 駒を表すアルファベット
# 出力： 文字 入力された駒を裏にひっくり返した文字
def promote(piece)
  { 'Q'=>'P','q'=>'p','M'=>'L','m'=>'l','O'=>'N','o'=>'n','T'=>'S',
    't'=>'s','H'=>'B','h'=>'b','D'=>'R','d'=>'r'}.index piece
end

# unpromote(piece)
# 成り駒をうけとって元の駒にして反す
# 入力： piece 文字 駒を表すアルファベット
# 出力： 文字 入力された駒を表にひっくり返した文字
def unpromote(piece)
  { 'Q'=>'P','q'=>'p','M'=>'L','m'=>'l','O'=>'N','o'=>'n','T'=>'S',
    't'=>'s','H'=>'B','h'=>'b','D'=>'R','d'=>'r'}[piece]
end

# promoted_check(piece)
# pieceが成りごまならtrue, そうでなければfalseを反す
# 入力： piece 文字 駒を表すアルファベット
# 出力： boolean 
def promoted_check(piece)
  'QMOTHDqmothd'.include? piece
end

# 指し手を受け取り、2ch盤面を動かし、動かした駒とその成り、不成りを返す
#  数値も、文字列も2ch形式である
#  入力： from 数値 始点
#         to   数値 終点
#         turn boolean 手番
#         board_info  配列 [board文字配列, 先手持ち駒Hash, 後手持ち駒Hash]
#  出力： 配列 [piece, promote_flag] = [動かした駒, その成り、不成り]
def move(from, to, turn)
  stand = (turn ? $black_stand : $white_stand)

  if to > 81 then  #  成ったとき
    promote_flag = true
    to -= 128
    if $board_2ch[to] != 'x' # 駒をとったとき
      gotten_p = $board_2ch[to].swapcase
      gotten_p = unpromote(gotten_p) if promoted_check(gotten_p) # 成駒をとったとき
      if turn then
        raise "wrong piece occured:1.-> #{gotten_p}\n" unless 'PLNSGBR'.include? gotten_p
      else
        raise "wrong piece occured:2.-> #{gotten_p}\n" unless 'plnsgbr'.include? gotten_p
      end
      stand[gotten_p] += 1
    end
    piece = $board_2ch[from] # 成るときも動かす駒の表示は表のまま　角成　とか。
    $board_2ch[to] = promote($board_2ch[from])  # 成ったので
    $board_2ch[from] = 'x'
  else # 成らないとき
    promote_flag = false
    if from > 81 then  # 持ち駒を打ったとき
      piece = 'plnsgbr'[from - 82].chr
      piece.upcase! if turn
      $board_2ch[to] = piece
      stand[piece] -= 1
      raise "minus hand occured.\n" if stand[piece] < 0
    else  #  盤上の移動の指し手
      if $board_2ch[to] != 'x' # 駒をとったとき
	gotten_p = $board_2ch[to].swapcase
	gotten_p = unpromote(gotten_p) if promoted_check(gotten_p) # 成駒をとったとき
	if turn then
	  raise "wrong piece occured:3.-> #{gotten_p}\n" unless 'PLNSGBR'.include? gotten_p
	else
	  raise "wrong piece occured:4.-> #{gotten_p}\n" unless 'plnsgbr'.include? gotten_p
	end
	stand[gotten_p] += 1
      end
      piece = $board_2ch[from]
      $board_2ch[to] = $board_2ch[from]
      $board_2ch[from] = 'x'
    end
  end
  [piece, promote_flag]

end

#
# 棋譜データのファイルから指定されたidの棋譜データを読み込み、返す
#   入力： id  棋譜のid
#   出力； 配列 [棋譜データ（バイト列）、手数]
#
def prepare_data(id_2ch)
  dir = File.dirname(__FILE__)
  bin_file = dir + '/../data/2chkifu.bin'
  hdr_file = dir + '/../data/2chkifu.hdr'

  binHandle = open(bin_file)

  # idで指定された棋譜の最初の位置まで移動する
  binHandle.pos = get_kifu_info(hdr_file, id_2ch)[0]

  # まず、この棋譜の手数の情報が4バイトで記述されている
  tesu_of_this = binHandle.read(4).unpack("I*")[0].to_i

  # 1手が２バイトなので、ここで棋譜全体を変数に保存
  kifu_data = binHandle.read(2 * tesu_of_this)

  # binファイルはもう閉じてよい
  binHandle.close

  [kifu_data, tesu_of_this]
end

#
# id で指定された棋譜をDB kifread に登録するためのqueryに加工して返す
#   入力： id  数値 棋譜のid
#          board_info  配列 [board文字列, 先手持ち駒文字列, 後手持ち駒文字列]
#   出力 : 文字列  kifreadテーブルに登録するためのinsert文の羅列（手数分）
#     出力文字列の一部サンプル：
=begin
insert into kifread values(  1,77,76,'P',false, true,'','lxpxxxPxLnbpxxxPRNsxpxxxPxSgxpxxxPxGkxpxxxPxKgxpxxxPxGsxpxxPxxSnrpxxxPBNlxpxxxPxL','');
insert into kifread values(  2,33,34,'p',false,false,'','lxpxxxPxLnbpxxxPRNsxxpxxPxSgxpxxxPxGkxpxxxPxKgxpxxxPxGsxpxxPxxSnrpxxxPBNlxpxxxPxL','');
insert into kifread values(  3,27,26,'P',false, true,'','lxpxxxPxLnbpxxPxRNsxxpxxPxSgxpxxxPxGkxpxxxPxKgxpxxxPxGsxpxxPxxSnrpxxxPBNlxpxxxPxL','');

 kifreadに入力しているのは手数、元の座標、進んだ座標、駒、成り・不成り、手番、先手持ち駒、盤面、後手持ち駒である。
=end
  #  注意：同じレコードにおける指し手と盤面情報の関係
  #        その盤面にそのレコードの指し手を指すと次のレコードの盤面になるのである
def kifu2ch_to_query(id)
  # 棋譜データファイルから、指定されたidの棋譜データ(２*手数バイトの数値の連続)と手数を取得
  kifu_data, tesu_of_this = prepare_data(id)
  bytes_to_query_text_type(kifu_data, tesu_of_this)
end

def bytes_to_query_text_type(kifu_data, tesu_of_this)
  ret = ''
  old_board = $board_2ch.clone
  old_black = ''
  old_white = ''
  1.upto(tesu_of_this) do |i|

    from_pos_2ch = kifu_data[(i-1)*2].to_i
    to_pos_2ch = kifu_data[(i-1)*2+1].to_i
    turn = (i%2 == 1)
    piece, promote = move(from_pos_2ch, to_pos_2ch, turn)

    from_pos_db = henkan(from_pos_2ch)
    to_pos_db = henkan(to_pos_2ch)

    ret += "insert into kifread values("
    ret += "%3d,%2d,%2d,'%s',%5s,%5s,'%s','%s','%s');\n" % [i, from_pos_db, to_pos_db, piece, promote, turn,old_black, old_board[1..-1], old_white]
    
    old_black = stand_to_str($black_stand)
    old_white = stand_to_str($white_stand)
    old_board = $board_2ch.clone

  end

  $black_hand = stand_to_str($black_stand)
  $white_hand = stand_to_str($white_stand)
  $board_2ch.shift
  ret += "insert into kifread values(\
    #{tesu_of_this+1}, null, null, null, null, #{(tesu_of_this + 1) % 2 == 1},\
    '#{$black_hand}', '#{$board_2ch}', '#{$white_hand}');"
  ret
end

