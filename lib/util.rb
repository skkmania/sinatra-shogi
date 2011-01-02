# -*- coding: utf-8 -*-
# vim: set fileencoding=utf-8 :
#
#  util.rb
#
  #
  #  state_log_format(state, opt)
  #    入力: Hash   Stateオブジェクトまたは同じ形のHashオブジェクト
  #          opt    出力の範囲を指定 'full'ならすべて
  #                 省略時はplayer情報は省く
  #    出力: 文字列 Stateオブジェクトを読みやすく並べた文字列 
  #
  def state_log_format(state, opt = nil)
    return '' if state.size == 0
    if opt
      keys = %w|status players mode blacks whites bid count turn board move next prev|
    else
      keys = %w|status mode move bid count turn board next prev|
    end
    keys.inject(""){|res, e| res += "#{e}\t: #{state[e]}\n" }
  end

  #
  #  csa2move
  #    入力: board Boardオブジェクト
  #        : line 文字列 CSA形式の指し手文字列 例：+7776FU
  #    出力: 配列 入力の指し手をDB上のmoveの形式に変換し、その属性を配列にしたもの
  #          例： +7776FU  ->  [77, 76, P, false]
  #
  def csa2move(board, line)
    pieces = {'FU' => 'p', 'KY' => 'l', 'KE' => 'n', 'GI' => 's',
              'KI' => 'g', 'OU' => 'k', 'HI' => 'r', 'KA' => 'b',
              'TO' => 'q', 'NY' => 'm', 'NK' => 'o', 'NG' => 't',
              'UM' => 'h', 'RY' => 'd'}
    turn = line[0] == '+'[0]
    from = line[1,2].to_i
    to   = line[3,4].to_i
    piece = pieces[ line[5,6] ]
    piece = piece.upcase if turn
    if 'plnsgkrb'.index(piece) >= 0
      promote = false
    else
      promote = true  
      # これだけでは成駒を動かしたときまでtrueになる。
      # 動かす前の状態を知らないといけないのだが、それはBoardに聞かないと
      # わからない
    end
    return [from, to, piece, promote]
  end
