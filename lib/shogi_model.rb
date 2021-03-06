# -*- coding: utf-8 -*-
# vim: set fileencoding=utf-8 :
#
#  shogi_model.rb
#
require 'lib/store.rb'

class ShogiModelException < Exception; end
class BoardException < ShogiModelException; end
class ParseCSAException < BoardException; end
class MoveException  < ShogiModelException; end

class Board
  Board::Initial_board_string =
   'lxpxxxPxLnbpxxxPRNsxpxxxPxSgxpxxxPxGkxpxxxPxKgxpxxxPxGsxpxxxPxSnrpxxxPBNlxpxxxPxL';
  def self.initial_board_string
    Board::Initial_board_string
  end
  @@p2csa =  {'p' => 'FU', 'l' => 'KY', 'n' => 'KE', 's' => 'GI',
              'g' => 'KI', 'k' => 'OU', 'r' => 'HI', 'b' => 'KA',
              'q' => 'TO', 'm' => 'NY', 'o' => 'NK', 't' => 'NG',
              'h' => 'UM', 'd' => 'RY'}

  def initialize(logger=Logger.new('log/board.log'))
    @blogger = logger
    @store  = Store.new
    @bid   = 1
    @board = Board::Initial_board_string.clone
    @black = ''
    @white = ''
    @turn  = true
  end
  attr_accessor :store, :bid, :board, :black, :white, :turn

#
#  to_csa_file(players)
#    機能: 現在のboardをgpsのバイナリに初期局面として渡すファイルの内容となる文字列にして返す
#    入力: 配列 [black player's name, white player's name]
#    出力: 文字列 
#      例:
#         N+skkmania
#         N-testgps
#         P1-KY-KE-GI-KI-OU-KI-GI-KE-KY
#         P2 * -HI *  *  *  *  * -KA *
#         P3-FU-FU-FU-FU-FU-FU-FU-FU-FU
#         P4 *  *  *  *  *  *  *  *  *
#         P5 *  *  *  *  *  *  *  *  *
#         P6 *  * +FU *  *  *  *  *  *
#         P7+FU+FU * +FU+FU+FU+FU+FU+FU
#         P8 * +KA *  *  *  *  * +HI *
#         P9+KY+KE+GI+KI+OU+KI+GI+KE+KY
#         -
#  副作用: なし
#
  def to_csa_file(players)
    @blogger.debug("entered in to_csa_file with #{players.join(',')}")
    ret  = 'N+' + players[0] + "\n"
    ret += 'N-' + players[1] + "\n"
    @blogger.debug("process: #{ret}")
    1.upto(9).each{|row|
       ret += "P#{row}"
       9.downto(1){|col|
         piece = get_piece(row + col*10)
         if piece == 'x'
           ret += ' * '
         else
           ret += ((piece.upcase == piece) ? '+':'-') + @@p2csa[piece.downcase]
         end
       }
       ret += "\n"
    }
    @blogger.debug("process: #{ret}")
    @blogger.debug("now @black is : #@black,  @white is #@white")
    @blogger.debug("class of @black is : #{@black.class},  @white is #{@white.class}")
    @blogger.debug("size of @black is : #{@black.size},  @white is #{@white.size}")
    ret += 'P+' + @black.split(//).map{|c| '00' + @@p2csa[c.downcase] }.join('') + "\n" if @black.size > 0
    ret += 'P-' + @white.split(//).map{|c| '00' + @@p2csa[c         ] }.join('') + "\n" if @white.size > 0
    @blogger.debug("process: #{ret}")
    @blogger.debug("now @turn is : #{@turn.to_s}")
    ret += (@turn ? '+' : '-') + "\n"
    @blogger.debug("leaving from to_csa_file with #{ret}")
    ret
  end
#
#  apply(line)
#    機能: lineで表現された指し手を現在のboardに適用する
#          @storeからとれる情報をとり、自らの情報を追加しHashを組み立て返す
#    入力: line 文字列 CSA形式の指し手文字列 例：+7776FU
#    出力: Hash lineで表現された指し手を適用してできた局面のbidのsectionのHash
#  副作用: 自身の値を変える
#
  def apply(line)
    @blogger.debug("entered in apply with #{line}")
    move = Move.new
    move.parse_csa(self, line)
    @blogger.debug("#{line} is converted to Move object : #{move.inspect}")
    _apply(move)
    @turn = !@turn
    @bid = (@store.complement(self, move))[0].bid
    @blogger.debug("@store became #{@store.dba.log_format @store}")
    @blogger.debug("@bid became : #@bid and going to get this bid's section")
    tmp = @store.get_section @bid
    @blogger.debug("leaving from apply with the result of get_section #@bid :\n #{@store.dba.log_format tmp}")
    tmp
  end

#
#  get_piece(pairdec)
#    盤上の駒の文字を取得する
#    入力: 2桁の数字 7六 -> 76
#    出力: 文字
#  副作用: なし
#
  def get_piece(pairdec)
    @board[pairdec2index(pairdec)].chr
  end

#
#  to_log
#    logに自身を記録するための文字列を返す
#    入力: なし
#    出力: 変換後の文字列
#  副作用: なし
#
  def to_log
    " bid:#@bid, turn:#@turn,\n board:#@board,\n black:#@black, white:#@white,\n" +
    " size of store : board -> #{(@store['board'] || []).size},\n" +
    "               : nextMoves -> #{(@store['nextMoves'] || []).size},\n" +
    "               : prevMoves -> #{(@store['prevMoves'] || []).size}"
  end

  #private
  #
  #  _apply(move)
  #
  def _apply(move)
    @blogger.debug("entered in _apply with #{move.inspect}")
    @blogger.debug("@board : #{@board}")
    @blogger.debug("@black : #{@black}")
    @blogger.debug("@white : #{@white}")
    players_stand = (move.is_black?) ? @black : @white
    destination_piece = @board[pairdec2index(move[:m_to])].chr
    @blogger.debug("destination_piece : #{destination_piece}")
    case
      when move.from_hand # 持ち駒を打つとき
        players_stand.sub! move[:piece], ''
        @board[pairdec2index(move[:m_to])] = move[:piece]
      when move.on_board  # 盤上の指し手
        if destination_piece != 'x'  # 駒をとる
           if 'qmothd'.index destination_piece.downcase
             destination_piece = un_promotes(destination_piece)
           end
           players_stand << destination_piece.swapcase
           @blogger.debug("players_stand became : #{players_stand}")
        end 
        if move[:promote]   # 成り
          @board[pairdec2index(move[:m_to])] = move.promoted_piece
        else                # 成りではない
          @board[pairdec2index(move[:m_to])] = move[:piece]
        end
        @board[pairdec2index(move[:m_from])] = 'x'
    end
    @blogger.debug("leaving from _apply with :")
    @blogger.debug("@board : #{@board}")
    @blogger.debug("@black : #{@black}")
    @blogger.debug("@white : #{@white}")
  end

  def un_promotes(piece)
    if 'qmothd'.index piece
      return {'q' => 'p', 'm' => 'l', 'o' => 'n', 't' => 's', 'd' => 'r', 'h' => 'b' }[piece]
    end
    if 'qmothd'.index piece.downcase
      return {'q' => 'p', 'm' => 'l', 'o' => 'n', 't' => 's', 'd' => 'r', 'h' => 'b' }[piece.downcase].upcase
    end
  end

  # pairdec とは7六 -> 76のように盤の符号を10進の数字にしたもの
  #    入力: 2桁の数字 7六 -> 76
  #    出力: [7,6]のように符号を数字の組pairにして配列にして返す
  def pairdec2pair(pairdec)
    pairdec.divmod 10
  end

  # pair2index とは7六 -> [7,6]のように盤の符号数字の配列を
  #  @board文字列のindexに変換して返す(0始まり。1一が0)
  #    入力: [7,6]のように符号を数字の組pairにした配列
  #    出力: 数字
  def pair2index(x, y)
    (x-1)*9 + y - 1
  end
  def pairdec2index(pairdec)
    pair2index(*pairdec2pair(pairdec))
  end

  #
  #  from_ary(ary)
  #    配列を読み、自身の値とする
  #    入力 : 配列 要素はすべて文字列 順序はbid,turn,black,board,white
  #    出力 : なし
  #    副作用 : 自身の値を変更する
  #
  def from_ary(ary)
    @bid    = ary[0].to_i
    @turn   = (ary[1] == 't')
    @black, @board, @white = ary[2..4]
  end

  #
  #  from_state(state)
  #    stateを読み、自身の値とする
  #    入力 : stateのHash valueはすべて文字列 keyはbid,turn,black,board,white
  #    出力 : なし
  #    副作用 : 自身の値を変更する
  #
  def from_state(state)
    @blogger.debug("entered in from_state with #{state.inspect}")
    @blogger.debug("board now is \n#{to_log}")
    @bid    = state['bid'].to_i
    @turn   = (state['turn'][0] == 't'[0])
    @board, @black, @white = state['board'].split(',',-1)[2..4]
    @blogger.debug("leaving from from_state. board became \n#{to_log}")
  end
end


  #  Moveオブジェクト DB上のmoveの形式
  #          例： +7776FU  ->  [:bid => 適用対象のBoardのbid,
  #                             :m_from => 77,
  #                             :m_to   => 76,
  #                             :piece  => 'P',
  #                             :promote => false,
  #                             :nxt_bid =>  適用後のBoardのbid]
class Move < Hash
  @@pieces = {'FU' => 'p', 'KY' => 'l', 'KE' => 'n', 'GI' => 's',
              'KI' => 'g', 'OU' => 'k', 'HI' => 'r', 'KA' => 'b',
              'TO' => 'q', 'NY' => 'm', 'NK' => 'o', 'NG' => 't',
              'UM' => 'h', 'RY' => 'd'}
  def self.pieces
    @@pieces
  end
  
  @@promotes = {'p' => 'q', 'l' => 'm', 'n' => 'o', 's' => 't', 'r' => 'd', 'b' => 'h' }
  @@un_promotes = {'q' => 'p', 'm' => 'l', 'o' => 'n', 't' => 's', 'd' => 'r', 'h' => 'b' }

  def initialize(ary = [], logger=Logger.new('log/move.log'))
    @mlogger = logger
    super(ary)
    self[:m_from]  = ary[0]
    self[:m_to]    = ary[1]
    self[:piece]   = ary[2]
    self[:promote] = ary[3]
  end
  #
  #  parse_csa(board, line)
  #    CSA形式の指し手文字列を読み自身にとりこむ
  #    入力  : board Boardオブジェクト
  #          : line 文字列 CSA形式の指し手文字列 例：+7776FU
  #            この文字列に改行がついていたら取りさって評価する
  #    出力  : なし
  #    副作用: 自身の値のほとんどを変更する.その方法は
  #         {:bid=>board.bidへ, :mid=>変更せず,
  #          :turn=>lineの1字目が+ならtrue, :m_from=>lineから,
  #          :m_to=>lineから, :piece=>board,lineから組合せて算出,
  #          :promote=>board,lineから組合せて算出,
  #    例： 初期盤面、+7776FU  -> {:bid=>1, :mid=>変更せず,
  #                   :turn=>true, :m_from=>77, :m_to=>76, :piece=>'P',
  #                   :promote=>false }
  #    例外条件: board.turnとlineの1字目が矛盾ならばParseCSAException
  #  注意：このメソッドにはこの手を指した盤面が必要
  #  その理由：DB上のmove形式とcsa形式の定義の違い
  #    成り駒の扱い：DBでは成る前の状態の駒の名前を保持
  #                  CSAでは成った後の駒の名前を表示
  #    CSAでは盤面がないと、その手が成りかどうかわからないのに
  #    DBではその手だけでわかることを要求している
  #
  def parse_csa(board, line)
    @mlogger.debug("into parse_csa with\n turn : #{board.turn.to_s},\n board : #{board.board},\n black : #{board.black},\n white : #{board.white}")
    @mlogger.debug("and line: #{line}")
    line.chomp!
    self[:bid]    = board.bid
    self[:turn]   = (line[0] == '+'[0])
    @mlogger.debug("self[:turn] became : #{self[:turn].to_s}")
    if self[:turn] != board.turn
      @mlogger.debug("ParseCSAException occured!!")
      raise ParseCSAException
    end
    self[:m_from] = line[1,2].to_i
    self[:m_to]   = line[3,4].to_i
    if (self[:m_from] == 0) then
      self[:piece] = @@pieces[ line[5,6] ]
      @mlogger.debug("self[:piece] became : #{self[:piece]}")
      if self[:turn] then
        self[:piece] = self[:piece].upcase
        # ここでupcase!とすると@@piecesが書き換わってしまうのでコピーにしてる
      end
    else
      self[:piece] = board.get_piece(self[:m_from])
    end
    self[:promote] = false
    if  'qmothd'.index(@@pieces[ line[5,6] ]) and # 動かした駒が成り駒,かつ
        'plnsbr'.index(self[:piece].downcase) then
                                    # 動かす前が成り駒でないとき
      self[:promote] = true  
    end
    @mlogger.debug("parsed move is : #{self.inspect}")
    @mlogger.debug("leaving parse_csa with\n board : #{board.board},\n black : #{board.black},\n white : #{board.white}")
  end

  def from_hand
    self[:m_from] == 0
  end

  def on_board
    self[:m_from] != 0
  end

  def is_black?
    self[:piece].upcase == self[:piece]
  end

  def promoted_piece
    if self[:piece].downcase == self[:piece]
      @@promotes[self[:piece].downcase]
    else
      @@promotes[self[:piece].downcase].upcase
    end
  end

  def unpromoted_piece
    if self[:piece].downcase == self[:piece]
      @@un_promotes[self[:piece].downcase]
    else
      @@un_promotes[self[:piece].downcase].upcase
    end
  end
#
#  to_log
#    logに自身を記録するための文字列を返す
#    入力: なし
#    出力: 変換後の文字列
#  副作用: なし
#
  def to_log
    [:bid, :mid, :turn, :m_from, :m_to, :piece, :promote, :nxt_bid].inject(
    "move : "){|r, e| r += "#{self[e]}, " }
  end
end
